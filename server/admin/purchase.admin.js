import AdminJS from 'adminjs'
import PurchaseModel from '../models/Purchase.js';
import  bundle  from "@adminjs/bundler"

const contentParent = {
    name: 'Satın Alımlar',
    icon: 'View',
}
const options = {
  
    parent: contentParent,

};

export default {
    options,
    resource: PurchaseModel
}