import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProfileDetails = ({ fetchedData, isSuperAdmin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    name,
    firstName,
    lastName,
    email,
    phoneNumber,
    role,
    _id: id,
  } = fetchedData || {};

  const detailRows = isSuperAdmin
    ? [
        { label: t("profileDetails.firstName"), value: firstName },
        { label: t("profileDetails.lastName"), value: lastName },
        { label: t("profileDetails.emailAddress"), value: email },
        { label: t("profileDetails.phoneNumberOptional"), value: phoneNumber },
        { label: t("profileDetails.role"), value: role, fullWidth: true },
      ]
    : [
        { label: t("profileDetails.name"), value: name },
        { label: t("profileDetails.emailAddress"), value: email },
        { label: t("profileDetails.phoneNumberOptional"), value: phoneNumber },
        { label: t("profileDetails.role"), value: role },
      ];

  return (
    <div className="fadeIn">
      <div className="tw-mb-5 tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3">
        <div>
          <h2 className="tw-mb-1 tw-text-2xl tw-font-semibold tw-text-slate-900">
            {t("profileDetails.title")}
          </h2>
          <p className="tw-m-0 tw-text-sm tw-text-slate-500">
            {t("profile.editProfileDescription")}
          </p>
        </div>
      </div>

      <div className="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
        {detailRows.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={item.fullWidth ? "md:tw-col-span-2" : ""}
          >
            <label className="tw-mb-1.5 tw-block tw-text-sm tw-font-semibold tw-text-slate-700">
              {item.label}
            </label>
            <div className="tw-flex tw-min-h-[48px] tw-items-center tw-rounded-xl tw-border tw-border-slate-200 tw-bg-slate-50 tw-px-4 tw-text-[15px] tw-font-medium tw-text-slate-800">
              {item?.value ? String(item.value) : "-"}
            </div>
          </div>
        ))}
      </div>

      <div className="tw-mt-6">
        <button
          type="button"
          onClick={() => navigate(`/admins/${id}`)}
          className="tw-inline-flex tw-items-center tw-rounded-xl tw-bg-[#1f3c88] tw-px-6 tw-py-2.5 tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-white tw-transition hover:tw-bg-[#162f6e]"
        >
          {t("common.edit")}
        </button>
      </div>
    </div>
  );
};

export default ProfileDetails;
