
export const commonRoute = {
  adminLogin: "/admin/login",
  signUp: "/sign-up",
  forgotpassword:"/forgotpasswords",
  resetPassword:'/reset-password',
  resetUserPassword:'/new-password',
  forgot:"/forgot",
  login: "/login",
  subLogin: "/login/:secreat",
  terms: "/terms",
  pricing: "/pricing",
  subscriptionSuccess: "/subscription/success",
  subscriptionManage: "/subscription/manage",
  cardList: "/card-list",
  bookservice:"/book-service",
  home:"/",
  service:"/service",
  services:"/services",
  serviceById:"/service/:id",
  categories:"/categories/:slug/:id",
  about:"/about",
  logins:"/sign-in",
  showprofile:"/showprofile/:id",
  contact:"/contact",
  register:"/register",
  city:"/city",
  district: "/district",
  regions: "/regions",
  // forgotpassword:"/forgotPassword",
  cart:"/cart",
  myServices:"/my-services",
  myBookings:"/my-bookings",
  chat:"/chat",
  prociderChat:"/providerChat",
  slots:"/slots",
  kycProcess:"/kyc-process",
  kycStatus:"/approve-kyc",
  kycApproval:"/kyc-approval",
  becomeprovider:"/become-provider",
  kycStatusDetail:"/approve-kyc/:id",
  notification: "/notifications",
  comments: "/comments",
  inquiry: "/inquiry",
  privacy: "/privacy",
  //dashboard
  dashboard: "/dashboard",
  publicAdPlacements: "/dashboard/public-ads",
  rankingRequests: "/dashboard/ranking-requests",
  dashboardType: "/dashboard/:dType",
  subscribers: "/dashboard/subscribers",
  pushNotification: "/dashboard/push-notification",
  newMessage: "/dashboard/push-notification/:mType",
  recentMessage: "/dashboard/push-notification/recent-message",

  usersJourney: "/dashboard/users-journey",
  usersJourneyDetail: "/dashboard/users-journey/details/:id",
  userData: "/dashboard/user-data",
  discount: "/dashboard/discount",
  newDiscount: "/dashboard/discount/:dType",
  newDiscountSummary: "/dashboard/discount/summary",
  recentDiscount: "/dashboard/discount/recent-discount",

  //beautician
  providers: "/providers",
  // beauticianDetails: "/beauticians/:id",
  providerDetails: "/providers/details/:id",
  providerDashboard: "/providers/providers-dashboard/:id",
  editRegisterProvider: "/providers/update/:bId",

  //client
  clients: "/clients",
  registerClient: "/clients/register",
  clientsArchived: "/clients/archive",
  clientDetails: "/clients/details/:id",

  // category
  category: "/category",

  // orders
  orders: "/orders",
  // admin order
  order:"/order",
  //brand
  brands: "/brands",
  brandsDetails: "/brands/:id",
  addBrand: "/brands/add-brand/step-1",
  addBrandProduct: "/brands/add-brand/product/step-2/:id",
  brandProductStep2: "/brands/add-brand/product-list/step-2/:id",
  brandProductReviewList: "/brands/add-brand/product-list/review/step-3/:id",
  // addProduct: "/brands/add-product",

  //service
  Adminservices: "/admin/services",
  servicesDetails: "/services/:id",
  servicesArchive: "/services/archive",

  //product
  products: "/products",
  productsArchive: "/products/archive",
  productsDetails: "/products/details/:id",

  //referrals
  referrals: "/referrals",
  recipient: "/recipient/:id",

  //gist
  cardPieChart: "/card-pie-chart",
  gist: "/gist",
  myGist: "/gist/my-gist",
  gistDetails: "/gist/:id",

  //admin
  admins: "/admins",
  addAdmin: "/admins/:type",
  myProfile: "/admins/profile-details/:id",
  changePassword: "/admins/change-password",

  //contact us
  contactUs: "/contact-us",

};
