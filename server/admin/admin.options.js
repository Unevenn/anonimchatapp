import AdminJS  from 'adminjs'
import AdminJSMongoose  from '@adminjs/mongoose'
import UserAdmin from './user.admin.js';
import PurchaseAdmin from './purchase.admin.js';

AdminJS.registerAdapter(AdminJSMongoose)

const options={
    resources:[UserAdmin,PurchaseAdmin],
    branding: {
        companyName: 'Falloven',
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