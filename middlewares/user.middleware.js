import db from '../dist/db/models/index.js';

const isValidUserById = async (req, res, next) => {
    const id = req.params.id;
    const response = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    if (!response) {
        return res.status(404).json({
            message: 'User not found'
        });
    }
    next();
};

const hasPermissions = async (req, res, next) => {
    const token = req.headers.token;
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    if(payload.id !== +req.params.id){
        return res.status(401).json({
            message: 'must login first'
        });
    }
    next();
}

const isAdmin = async (req, res, next) => {
    const token = req.headers.token;
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    if(!payload.roles.includes('admin')){
        return res.status(401).json({
            message: 'must be admin, first registered user will be the admin'
        });
    }
    next();
}

export default {
    isValidUserById,
    hasPermissions,
    isAdmin
};