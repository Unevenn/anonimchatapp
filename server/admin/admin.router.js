// import { default as AdminBro } from 'adminjs';
// import { buildAuthenticatedRouter } from 'admin-bro-expressjs';
// import express from 'express';
// import { connection } from 'mongoose';
// import session from 'express-session';
// const MongoStore = require('connect-mongo')(session);

// /**
//  * @param {AdminBro} admin
//  * @return {express.Router} router
//  */
// const buildAdminRouter = (admin) => {
//   const router = buildAuthenticatedRouter(admin, {
//     cookieName: 'admin-bro',
//     cookiePassword: 'superlongandcomplicatedname',
//     authenticate: async (email, password) => {
//       const company = await Company.findOne({ email });

//       if (company && await verify(company.encryptedPassword, password)) {
//         return company.toJSON();
//       }
//       return null;
//     },
//   }, null, {
//     resave: false,
//     saveUninitialized: true,
//     store: new MongoStore({ mongooseConnection: connection }),
//   });
//   return router;
// };

// export default buildAdminRouter;