import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();


router.get('/getAllUsers',
    [
        AuthMiddleware.validateToken,
        UserMiddleware.isAdmin
    ],
    async (req, res) => {
        const response = await UserService.getAllUsers();
        res.status(response.code).json(response.data);

});

router.get('/findUsers',
    [
        AuthMiddleware.validateToken,
        UserMiddleware.isAdmin
    ],
    async (req, res) => {
        const response = await UserService.findUsers(req,res);
        res.status(response.code).json(response.data);

});

router.get('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

//router.delete('/deleteAll', async(req,res)=> {
//        const response = await UserService.deleteAll();
//        res.status(response.code).json(response.message);
//    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
    });

router.post('/bulkCreate',
    [
        AuthMiddleware.validateToken,
        UserMiddleware.isAdmin
    ],
    async (req, res) => {
        const response = await UserService.bulkCreate(req.body);
        res.status(response.code).json(response.data);
});


export default router;