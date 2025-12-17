import { registerTranslation } from 'react-native-paper-dates';
import { resolveServices } from '@/services';

registerTranslation('default', () => {
  // I don't expect this to cause issues because it will only resolve after rendering, and we should have the services by then
  const t = resolveServices(null!).tolgee.t;
  return {
    save: t('generic.save.button'),
    selectSingle: t('date.select.button'),
    selectMultiple: t('date.select_multiple.button'),
    selectRange: t('stats.select_period.label'),
    notAccordingToDateFormat: (inputFormat) =>
      t('validation.date_format_must_be.message', { inputFormat }),
    mustBeHigherThan: (date) =>
      t('validation.must_be_later_than.message', { date }),
    mustBeLowerThan: (date) =>
      t('validation.must_be_earlier_than.message', { date }),
    mustBeBetween: (startDate, endDate) =>
      t('validation.must_be_between.message', { startDate, endDate }),
    dateIsDisabled: t('validation.day_not_allowed.message'),
    previous: t('generic.previous.button'),
    next: t('generic.next.button'),
    typeInDate: t('date.type_in.button'),
    pickDateFromCalendar: t('date.pick_from_calendar.button'),
    close: t('generic.close.button'),
    minute: t('generic.minute.label'),
    hour: t('generic.hour.label'),
  };
});
