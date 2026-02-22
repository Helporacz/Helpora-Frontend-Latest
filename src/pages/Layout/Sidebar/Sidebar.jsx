import { useNavigate, useLocation } from "react-router-dom";
import { commonRoute, icons } from "utils/constants";
import "./Sidebar.scss";
import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import logo from "../../../assets/images/White_Logo.png";
import { getLocalizedPath } from "utils/localizedRoute";
import { useTranslation } from "react-i18next";

const normalizePath = (path = "") => {
  const cleanPath = String(path || "").split("?")[0].split("#")[0];
  if (!cleanPath) return "/";
  if (cleanPath.length === 1) return cleanPath;
  return cleanPath.replace(/\/+$/, "");
};

const isPathMatch = (currentPath, targetPath, exact = false) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);
  if (!target || target === "/") return current === target;
  if (exact) return current === target;
  return current === target || current.startsWith(`${target}/`);
};

const hasMoreSpecificMenuMatch = (currentPath, currentMenu, menuList = []) => {
  const currentMenuPath = normalizePath(currentMenu?.url);
  if (!currentMenuPath || currentMenuPath === "/") return false;

  return menuList.some((otherMenu) => {
    if (!otherMenu?.url || otherMenu.id === currentMenu.id) return false;
    const otherPath = normalizePath(otherMenu.url);
    if (otherPath === currentMenuPath) return false;
    const isChildPath = otherPath.startsWith(`${currentMenuPath}/`);
    return isChildPath && isPathMatch(currentPath, otherPath);
  });
};

const Sidebar = () => {
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [openSubMenuId, setOpenSubMenuId] = useState(null);
  const ref = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const userRole = localStorage.getItem("userRole");
  const requireProviderSubscription =
    localStorage.getItem("requireProviderSubscription") !== "false";
  const leftMenu = [
    {
      id: 1,
      title: t("sidebar.title1"),
      icon: icons.dashboardIcon,
      url: getLocalizedPath("/dashboard", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/dashboard", i18n.language),
    },
    {
      id: 2,
      title: t("sidebar.title2"),
      icon: icons.beautician,
      url: getLocalizedPath("/providers", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/providers", i18n.language),
    },
    {
      id: 3,
      title: t("sidebar.title3"),
      icon: icons.people,
      url: getLocalizedPath("/clients", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/clients", i18n.language),
    },
    {
      id: 4,
      title: t("sidebar.subscribers"),
      icon: icons.people,
      url: getLocalizedPath(commonRoute.subscribers, i18n.language),
      isTrue: false,
      redirect: getLocalizedPath(commonRoute.subscribers, i18n.language),
    },
    {
      id: 18,
      title: t("sidebar.publicAds"),
      icon: icons.promotions,
      url: getLocalizedPath(commonRoute.publicAdPlacements, i18n.language),
      isTrue: false,
      redirect: getLocalizedPath(commonRoute.publicAdPlacements, i18n.language),
    },
    {
      id: 19,
      title: t("sidebar.rankingRequests"),
      icon: icons.promotions,
      url: getLocalizedPath(commonRoute.rankingRequests, i18n.language),
      isTrue: false,
      redirect: getLocalizedPath(commonRoute.rankingRequests, i18n.language),
    },
    {
      id: 5,
      title: t("sidebar.title4"),
      icon: icons.categoryIcon,
      url: getLocalizedPath("/category", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/category", i18n.language),
    },
    {
      id: 6,
      title: t("sidebar.title5"),
      icon: icons.products,
      url: getLocalizedPath("/admin/services", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/admin/services", i18n.language),
    },
    {
      id: 7,
      title: t("sidebar.title6"),
      icon: icons.services,
      url: getLocalizedPath("/orders", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/orders", i18n.language),
    },

    {
      id: 8,
      title: t("sidebar.title7"),
      icon: icons.brand,
      url: getLocalizedPath("/my-services", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/my-services", i18n.language),
    },
    {
      id: 9,
      title: t("sidebar.title8"),
      icon: icons.services,
      url: getLocalizedPath("/order", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/order", i18n.language),
    },
    {
      id: 10,
      title: t("sidebar.title9"),
      icon: icons.gist,
      url: getLocalizedPath("/providerChat", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/providerChat", i18n.language),
    },
    {
      id: 11,
      title: t("sidebar.title10"),
      icon: icons.slotIcon,
      url: getLocalizedPath("/slots", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/slots", i18n.language),
    },
    {
      id: 12,
      title: t("sidebar.title11"),
      icon: icons.bell,
      url: getLocalizedPath("/kyc-process", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/kyc-process", i18n.language),
    },
    {
      id: 13,
      title: t("sidebar.title12"),
      icon: icons.KYCIcon,
      url: getLocalizedPath("/approve-kyc", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/approve-kyc", i18n.language),
      subMenu: [
        {
          title: t("sidebar.approvedKYC"),
          url: getLocalizedPath("/approve-kyc", i18n.language),
          redirect: getLocalizedPath("/approve-kyc", i18n.language),
        },
        {
          title: t("sidebar.KYCApproval"),
          url: getLocalizedPath("/kyc-approval", i18n.language),
          redirect: getLocalizedPath("/kyc-approval", i18n.language),
        },
      ],
    },
    {
      id: 14,
      title: t("sidebar.title13"),
      icon: icons.reviewIcon,
      url: getLocalizedPath("/comments", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/comments", i18n.language),
    },
    {
      id: 15,
      title: t("sidebar.title14"),
      icon: icons.bell,
      url: getLocalizedPath("/inquiry", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/inquiry", i18n.language),
    },
    {
      id: 16,
      title: t("sidebar.subscription"),
      icon: icons.cart,
      url: getLocalizedPath(commonRoute.subscriptionManage, i18n.language),
      isTrue: false,
      redirect: getLocalizedPath(commonRoute.subscriptionManage, i18n.language),
    },
    {
      id: 17,
      title: t("sidebar.title15"),
      icon: icons.KYCIcon,
      url: getLocalizedPath("/regions", i18n.language),
      isTrue: false,
      redirect: getLocalizedPath("/regions", i18n.language),
      subMenu: [
        {
          title: t("sidebar.regions"),
          url: getLocalizedPath("/regions", i18n.language),
          redirect: getLocalizedPath("/regions", i18n.language),
        },
        {
          title: t("sidebar.city"),
          url: getLocalizedPath("/city", i18n.language),
          redirect: getLocalizedPath("/city", i18n.language),
        },
        {
          title: t("sidebar.district"),
          url: getLocalizedPath("/district", i18n.language),
          redirect: getLocalizedPath("/district", i18n.language),
        },
      ],
    },
  ];

  const handleClickOutside = (e) => {
    if (ref && ref?.current && !ref.current.contains(e.target)) {
      setShowCardMenu(false);
    }
    if (e?.target?.id === "Dashboard") {
      setShowCardMenu(!showCardMenu);
    }
    if (e.target?.id === "More Options") {
      setOpenSubMenuId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  // Auto-open submenu if any child is active
  useEffect(() => {
    const currentPath = location.pathname;
    const menuWithActiveChild = leftMenu.find((menuItem) => {
      if (menuItem.subMenu) {
        return menuItem.subMenu.some((subItem) => isPathMatch(currentPath, subItem.url));
      }
      return false;
    });
    if (menuWithActiveChild && openSubMenuId !== menuWithActiveChild.id) {
      setOpenSubMenuId(menuWithActiveChild.id);
    }
  }, [location.pathname, leftMenu, openSubMenuId]);

  const roleMenuMap = {
    superAdmin: [
      t("sidebar.title1"),
      t("sidebar.title2"),
      t("sidebar.title3"),
      t("sidebar.subscribers"),
      t("sidebar.rankingRequests"),
      t("sidebar.publicAds"),
      t("sidebar.title4"),
      t("sidebar.title5"),
      t("sidebar.title8"),
      t("sidebar.title12"),
      t("sidebar.title13"),
      t("sidebar.title14"),
      t("sidebar.title15"),
    ],
    provider: [
      t("sidebar.title1"),
      t("sidebar.title11"),
      t("sidebar.title3"),
      t("sidebar.title6"),
      t("sidebar.title7"),
      t("sidebar.title10"),
      t("sidebar.title9"),
      ...(requireProviderSubscription ? [t("sidebar.subscription")] : []),
    ],
  };
  const filteredMenu = leftMenu.filter((menuItem) =>
    roleMenuMap[userRole]?.includes(menuItem.title)
  );

  return (
    <div id="left-side-block">
      <div className="top-icon-block">
        <img style={{ width: "180px" }} src={logo} alt="" />
      </div>
      <div className="menu-list-container d-flex flex-column gap-3">
        {filteredMenu.map((elem, index) => {
          const { url, title, icon, menuIcon, redirect, subMenu, cardSubMenu } =
            elem;

          const currentPath = location.pathname;
          const hasSpecificChildActive = hasMoreSpecificMenuMatch(
            currentPath,
            elem,
            filteredMenu
          );
          const subMenuActive = !!subMenu?.some((subItem) =>
            isPathMatch(currentPath, subItem.url)
          );
          const isParentActive =
            subMenuActive ||
            isPathMatch(currentPath, url, true) ||
            (isPathMatch(currentPath, url) && !hasSpecificChildActive);

          return (
            <React.Fragment key={index}>
              <div
                className={`menu-list-item ${
                  isParentActive ? "active-menu-item" : "inactive-menu-item"
                }`}
                key={index}
                onClick={() => {
                  if (cardSubMenu) {
                  } else if (subMenu) {
                    // Toggle submenu: if already open, close it; otherwise open it
                    setOpenSubMenuId(
                      openSubMenuId === elem.id ? null : elem.id
                    );
                  } else {
                    navigate(redirect);
                  }
                }}
              >
                <span>
                  <img src={icon} alt="icon" className="menuIcon" />
                </span>
                <span id={title}>{title}</span>
                {menuIcon && (
                  <span>
                    <img src={menuIcon} alt="icon" className="rightMenuIcon" />
                  </span>
                )}
              </div>

              {/*for dashboard submenu*/}
              {showCardMenu && cardSubMenu && (
                <div className="cardSubMenu-item-container" ref={ref}>
                  {cardSubMenu?.map((cElem, cIndex) => {
                    const isCardSubMenuActive = isPathMatch(
                      window.location.pathname,
                      cElem?.url
                    );
                    return (
                      <div
                        href={cElem?.href}
                        key={cIndex}
                        className={`cardSubMenu-item ${
                          isCardSubMenuActive
                            ? "active-cardSubMenu-item"
                            : "inactive-cardSubMenu-item"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isCardSubMenuActive) {
                            navigate(cElem?.redirect);
                          }
                        }}
                      >
                        <div>
                          <div>{cElem?.title}</div>
                          <div className="text-13-500-21 color-black-60">
                            {cElem?.subTitle}
                          </div>
                        </div>
                        {isCardSubMenuActive && (
                          <div>
                            <img
                              src={cElem?.cardSubMenuIcon}
                              alt="icon"
                              className="rightMenuIcon"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {openSubMenuId === elem.id && subMenu?.length > 0 && (
                <div className="">
                  {subMenu?.map((cElem, cIndex) => {
                    const isSubMenuActive = isPathMatch(location.pathname, cElem?.url);
                    return (
                      <div
                        href={cElem?.href}
                        key={cIndex}
                        className={`sub-menu-item ${
                          isSubMenuActive
                            ? "active-sub-menu-item"
                            : "inactive-sub-menu-item"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isSubMenuActive) {
                            navigate(cElem?.redirect);
                          }
                        }}
                      >
                        {cElem?.title}
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default Sidebar;
