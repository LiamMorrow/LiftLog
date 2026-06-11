import { describe, expect, it, vi } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { applyProgramEffects } from '@/store/program/effects';
import {
  importPlanFromFile,
  importPlanFromJson,
  savePlanAndSetActive,
} from '@/store/program';
import { showSnackbar } from '@/store/app';

function makeProgramJson(name: string) {
  return new ProgramBlueprint(name, [], LocalDate.now()).toJSON();
}

const baseProgramState = {
  program: {
    activePlanId: 'base-plan',
    isHydrated: true,
    upcomingSessions: undefined,
    savedPrograms: {
      'base-plan': new ProgramBlueprint('Base Plan', [], LocalDate.now()).toPOJO(),
    },
  },
};

describe('program import effects', () => {
  it('imports wrapper payload and saves a new plan', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: { tolgee: { t: (s: string) => s } },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(
      importPlanFromJson({
        json: {
          type: 'LiftLogPlanExport',
          formatVersion: 1,
          program: makeProgramJson('Imported Plan'),
        },
      }),
    );

    expect(
      testBed.getDispatchedAction(savePlanAndSetActive).payload
      .programBlueprint.name,
    ).toBe('Imported Plan');
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'plan.import.success.message',
    );
  });

  it('imports raw ProgramBlueprintJSON payload and saves a new plan', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: { tolgee: { t: (s: string) => s } },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(
      importPlanFromJson({ json: makeProgramJson('Raw Imported Plan') }),
    );

    expect(
      testBed.getDispatchedAction(savePlanAndSetActive).payload
        .programBlueprint.name,
    ).toBe('Raw Imported Plan');
  });

  it('handles unsupported wrapper versions', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: { tolgee: { t: (s: string) => s } },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(
      importPlanFromJson({
        json: {
          type: 'LiftLogPlanExport',
          formatVersion: 2,
          program: makeProgramJson('Unsupported Plan'),
        },
      }),
    );

    testBed.expectNotDispatched(savePlanAndSetActive);
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'plan.import.unsupported_format.message',
    );
  });

  it('handles invalid plan payloads', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: { tolgee: { t: (s: string) => s } },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(importPlanFromJson({ json: null }));

    testBed.expectNotDispatched(savePlanAndSetActive);
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'plan.import.invalid_file.message',
    );
  });

  it('renames conflicting imported plan names deterministically', async () => {
    const testBed = createAddEffectTestBed({
      initialState: {
        program: {
          activePlanId: 'plan-1',
          isHydrated: true,
          upcomingSessions: undefined,
          savedPrograms: {
            'plan-1': new ProgramBlueprint(
              'Imported Plan',
              [],
              LocalDate.now(),
            ).toPOJO(),
            'plan-2': new ProgramBlueprint(
              'Imported Plan (Imported)',
              [],
              LocalDate.now(),
            ).toPOJO(),
          },
        },
      },
      services: { tolgee: { t: (s: string) => s } },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(
      importPlanFromJson({ json: makeProgramJson('Imported Plan') }),
    );

    expect(
      testBed.getDispatchedAction(savePlanAndSetActive).payload
        .programBlueprint.name,
    ).toBe('Imported Plan (Imported 2)');
  });

  it('does nothing when picker is cancelled', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: {
        tolgee: { t: (s: string) => s },
        filePickerService: {
          pickFile: vi.fn().mockResolvedValue(undefined),
        },
      },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(importPlanFromFile());

    testBed.expectNotDispatched(importPlanFromJson);
    testBed.expectNotDispatched(savePlanAndSetActive);
  });

  it('shows invalid file message for malformed JSON bytes', async () => {
    const testBed = createAddEffectTestBed({
      initialState: baseProgramState,
      services: {
        tolgee: { t: (s: string) => s },
        filePickerService: {
          pickFile: vi
            .fn()
            .mockResolvedValue({ bytes: new TextEncoder().encode('{') }),
        },
      },
    });
    applyProgramEffects(testBed.addEffect);

    await testBed.dispatchHandled(importPlanFromFile());

    testBed.expectNotDispatched(importPlanFromJson);
    expect(testBed.getDispatchedAction(showSnackbar).payload.text).toBe(
      'plan.import.invalid_file.message',
    );
  });
});
