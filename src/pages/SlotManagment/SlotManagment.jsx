import MessagePopup from "components/layouts/MessagePopup/MessagePopup";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  getProviderDefaultAvailabilityAPI,
  saveDefaultAvailabilityAPI,
} from "store/globalSlice";

const DEFAULT_AVAILABILITY = {
  startTime: "09:00",
  endTime: "17:00",
  workingDays: [1, 2, 3, 4, 5, 6], // Monday-Saturday
};

const HOUR_SLOT_PATTERN = /^([01]\d|2[0-3]):00$/;

const DAY_OPTIONS = [
  { value: 1, fallbackLabel: "Monday" },
  { value: 2, fallbackLabel: "Tuesday" },
  { value: 3, fallbackLabel: "Wednesday" },
  { value: 4, fallbackLabel: "Thursday" },
  { value: 5, fallbackLabel: "Friday" },
  { value: 6, fallbackLabel: "Saturday" },
  { value: 0, fallbackLabel: "Sunday" },
];

const normalizeAvailability = (input = {}) => {
  const startTime = String(input?.startTime || DEFAULT_AVAILABILITY.startTime);
  const endTime = String(input?.endTime || DEFAULT_AVAILABILITY.endTime);
  const workingDays = Array.isArray(input?.workingDays)
    ? Array.from(
        new Set(
          input.workingDays
            .map((day) => Number(day))
            .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
        )
      ).sort((left, right) => left - right)
    : [...DEFAULT_AVAILABILITY.workingDays];

  return {
    startTime: HOUR_SLOT_PATTERN.test(startTime)
      ? startTime
      : DEFAULT_AVAILABILITY.startTime,
    endTime: HOUR_SLOT_PATTERN.test(endTime)
      ? endTime
      : DEFAULT_AVAILABILITY.endTime,
    workingDays: workingDays.length ? workingDays : [...DEFAULT_AVAILABILITY.workingDays],
  };
};

const SlotManagementWeekly = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const providerId = localStorage.getItem("userId");

  const [availability, setAvailability] = useState({ ...DEFAULT_AVAILABILITY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messagePopup, setMessagePopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const dayOptions = useMemo(
    () =>
      DAY_OPTIONS.map((day) => ({
        ...day,
        label: t(
          `availabilitySettings.days.${String(day.value)}`,
          day.fallbackLabel
        ),
      })),
    [t]
  );

  const showMessage = (type, title, message) => {
    setMessagePopup({
      show: true,
      title,
      message,
      type,
    });
  };

  const loadAvailability = async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(getProviderDefaultAvailabilityAPI(providerId));
      if (response?.success && response?.defaultAvailability) {
        setAvailability(normalizeAvailability(response.defaultAvailability));
      } else {
        setAvailability({ ...DEFAULT_AVAILABILITY });
      }
    } catch (error) {
      console.error("Error loading provider availability:", error);
      setAvailability({ ...DEFAULT_AVAILABILITY });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, [providerId]);

  const toggleWorkingDay = (dayValue) => {
    setAvailability((prev) => {
      const hasDay = prev.workingDays.includes(dayValue);
      const nextDays = hasDay
        ? prev.workingDays.filter((day) => day !== dayValue)
        : [...prev.workingDays, dayValue];

      return {
        ...prev,
        workingDays: nextDays.sort((left, right) => left - right),
      };
    });
  };

  const handleSave = async () => {
    const startTime = String(availability.startTime || "").trim();
    const endTime = String(availability.endTime || "").trim();
    const workingDays = Array.isArray(availability.workingDays)
      ? availability.workingDays
      : [];

    if (workingDays.length === 0) {
      showMessage(
        "warning",
        t("availabilitySettings.validationTitle", "Validation"),
        t("availabilitySettings.atLeastOneDay", "Select at least one available day.")
      );
      return;
    }

    if (!HOUR_SLOT_PATTERN.test(startTime) || !HOUR_SLOT_PATTERN.test(endTime)) {
      showMessage(
        "warning",
        t("availabilitySettings.validationTitle", "Validation"),
        t(
          "availabilitySettings.fullHourOnly",
          "Use full-hour values such as 09:00 or 17:00."
        )
      );
      return;
    }

    if (startTime >= endTime) {
      showMessage(
        "warning",
        t("availabilitySettings.validationTitle", "Validation"),
        t("availabilitySettings.invalidRange", "End time must be later than start time.")
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        startTime,
        endTime,
        workingDays,
      };
      const response = await dispatch(saveDefaultAvailabilityAPI(providerId, payload));

      if (response?.success) {
        setAvailability(normalizeAvailability(response.defaultAvailability || payload));
        showMessage(
          "success",
          t("availabilitySettings.successTitle", "Success"),
          t(
            "availabilitySettings.savedSuccess",
            "Availability updated successfully."
          )
        );
      } else {
        showMessage(
          "error",
          t("availabilitySettings.errorTitle", "Error"),
          response?.message ||
            t("availabilitySettings.saveFailed", "Failed to update availability.")
        );
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      showMessage(
        "error",
        t("availabilitySettings.errorTitle", "Error"),
        t("availabilitySettings.saveFailed", "Failed to update availability.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="tw-mx-auto tw-mt-6 tw-flex tw-max-w-5xl tw-items-center tw-gap-2 tw-px-3">
        <span
          className="tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-[#112d58] tw-border-t-transparent"
          aria-hidden="true"
        />
        <span className="tw-text-sm tw-text-slate-700">
          {t("availabilitySettings.loading", "Loading availability...")}
        </span>
      </div>
    );
  }

  return (
    <>
      <MessagePopup
        show={messagePopup.show}
        onHide={() => setMessagePopup((prev) => ({ ...prev, show: false }))}
        title={messagePopup.title}
        message={messagePopup.message}
        type={messagePopup.type}
      />

      <div className="tw-mx-auto tw-mt-6 tw-max-w-5xl tw-px-3">
        <div className="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5 tw-shadow-sm md:tw-p-6">
          <div className="tw-mb-5 tw-flex tw-flex-col tw-gap-2">
            <h3 className="tw-mb-0 tw-text-2xl tw-font-semibold tw-text-slate-900">
              {t("availabilitySettings.heading", "Availability Settings")}
            </h3>
            <p className="tw-mb-0 tw-text-sm tw-text-slate-600 md:tw-text-base">
              {t(
                "availabilitySettings.description",
                "Set your working days and booking hours. Customers can request only these slots."
              )}
            </p>
          </div>

          <div className="tw-mb-5 tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
            <div className="tw-space-y-2">
              <label
                htmlFor="availability-start-time"
                className="tw-text-sm tw-font-semibold tw-text-slate-800"
              >
                {t("availabilitySettings.startTime", "Start time")}
              </label>
              <input
                id="availability-start-time"
                type="time"
                step={3600}
                value={availability.startTime}
                onChange={(event) =>
                  setAvailability((prev) => ({
                    ...prev,
                    startTime: event.target.value,
                  }))
                }
                className="tw-block tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-900 focus:tw-border-brand-green focus:tw-outline-none"
              />
            </div>
            <div className="tw-space-y-2">
              <label
                htmlFor="availability-end-time"
                className="tw-text-sm tw-font-semibold tw-text-slate-800"
              >
                {t("availabilitySettings.endTime", "End time")}
              </label>
              <input
                id="availability-end-time"
                type="time"
                step={3600}
                value={availability.endTime}
                onChange={(event) =>
                  setAvailability((prev) => ({
                    ...prev,
                    endTime: event.target.value,
                  }))
                }
                className="tw-block tw-h-11 tw-w-full tw-rounded-xl tw-border tw-border-slate-300 tw-bg-white tw-px-3 tw-text-sm tw-text-slate-900 focus:tw-border-brand-green focus:tw-outline-none"
              />
            </div>
          </div>

          <div className="tw-mb-6">
            <p className="tw-mb-3 tw-text-sm tw-font-semibold tw-text-slate-800">
              {t("availabilitySettings.daysLabel", "Available days")}
            </p>
            <div className="tw-flex tw-flex-wrap tw-gap-2.5">
              {dayOptions.map((day) => {
                const checked = availability.workingDays.includes(day.value);
                return (
                  <label
                    key={day.value}
                    htmlFor={`availability-day-${day.value}`}
                    className={`tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-rounded-full tw-border tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium ${
                      checked
                        ? "tw-border-brand-green tw-bg-brand-green/10 tw-text-[#116227]"
                        : "tw-border-slate-300 tw-bg-white tw-text-slate-700 hover:tw-border-slate-400"
                    }`}
                  >
                    <input
                      id={`availability-day-${day.value}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleWorkingDay(day.value)}
                      className="tw-h-4 tw-w-4 tw-cursor-pointer tw-rounded tw-border-slate-300 tw-text-brand-green focus:tw-ring-brand-green/40"
                    />
                    <span>{day.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="tw-flex tw-justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="tw-inline-flex tw-h-11 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[#112d58] tw-px-5 tw-text-sm tw-font-semibold tw-text-white tw-transition hover:tw-bg-[#0b2142] disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
            >
              {saving
                ? t("availabilitySettings.saving", "Saving...")
                : t("availabilitySettings.save", "Save availability")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlotManagementWeekly;
