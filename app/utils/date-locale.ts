import { registerTranslation } from 'react-native-paper-dates';
import { resolveServices } from '@/services';

registerTranslation('default', () => {
  // I don't expect this to cause issues because it will only resolve after rendering, and we should have the services by then
  const t = resolveServices(null!).tolgee.t;
  return {
    save: t('Save'),
    selectSingle: t('SelectDate'),
    selectMultiple: t('SelectDates'),
    selectRange: t('SelectPeriod'),
    notAccordingToDateFormat: (inputFormat) =>
      t(`DateFormatMustBe{inputFormat}`, { inputFormat: inputFormat }),
    mustBeHigherThan: (date) => t(`MustBeLaterThan{date}`, { date }),
    mustBeLowerThan: (date) => t(`MustBeEarlierThan{date}`, { date }),
    mustBeBetween: (startDate, endDate) =>
      t(`MustBeBetween{startDate}-{endDate}`, { startDate, endDate }),
    dateIsDisabled: t('DayIsNotAllowed'),
    previous: t('Previous'),
    next: t('Next'),
    typeInDate: t('TypeInDate'),
    pickDateFromCalendar: t('PickDateFromCalendar'),
    close: t('Close'),
    minute: t('Minute'),
    hour: t('Hour'),
  };
});
