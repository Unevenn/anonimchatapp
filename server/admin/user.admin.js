import AdminJS from 'adminjs'
import UserModel from '../models/User.js';
import  bundle  from "@adminjs/bundler"

const contentParent = {
    name: 'Kullanıcılar',
    icon: 'View',
}
const options = {
    properties: {
        password: {
            isVisible: false
        },
        pushToken: {
            isVisible: false
        }, interactions: {
            isVisible: false
        }, image: {
            isVisible: true,

        }, id: {
            show: true,
            edit: false, 
            filter: false,
        },
        location: {
            show: false,
            edit: false,
            filter: false,
        },
        about: { type: 'richtext' },
        gender: {
            name: 'Cinsiyet',
            label: 'Cinsiyet',
            availableValues: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
            ],
        },
        subscribeStatus: {
            name: 'Abonelik',
            label: 'Abonelik',
            availableValues: [
                { value: 'none', label: 'None' },
                { value: 'monthly', label: 'Monthly' },
                { value: '6monthly', label: '6 Monthly' },
                { value: 'yearly', label: 'Yearly' },
            ],
        }
    },
    parent: contentParent,
    listProperties: ['name', 'email', 'about', "star", "subscribeStatus"],

};

export default {
    options,
    resource: UserModel
}