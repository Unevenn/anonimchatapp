import AdminJS  from 'adminjs'
import AdminJSExpress  from '@adminjs/express'
import AdminJSMongoose  from '@adminjs/mongoose'
import UserAdmin from './user.admin.js';

AdminJS.registerAdapter(AdminJSMongoose)

const options={
    resources:[UserAdmin],
    branding: {
        companyName: 'OJO',
      },
      locale: {
        translations: {
          labels: {
            Article: 'Amazing Article'
          }
        }
      },
}


export default options