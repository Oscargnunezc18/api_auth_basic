import db from '../dist/db/models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { where } from 'sequelize';
import { query } from 'express';

const bulkCreate = async (datos) => {
    const resultado ={ingresados:0,fallos:0}
    for (const usuario of datos){
        const response = await createUser(usuario);
        if (response.code == 200){
            resultado.ingresados= resultado.ingresados+1;
        }
        else{
            resultado.fallos= resultado.fallos+1;
        }
    }; 
    return {
        code: 200,
        data: resultado
    };
}

const createUser = async (datos_usuario) => {

    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = datos_usuario;

    if (email === undefined){
        return{
            code:400,
            message: "invalid email"
        }
    }
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });

    if (await db.User.count() == 1){
        await db.Role.create({
            id_user : newUser.id,
            type : 'admin',
            status: true
        });
    }else{
        await db.Role.create({
            id_user : newUser.id,
            type : 'User',
            status: true 
        });
    }
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const getAllUsers = async (req,res) => {
    const users = await db.User.findAll({
        where:{
            status: true
        }
    });
    console.log(users);
    return {
        code: 200,
        data: users.map(nombre=>nombre.name)
    };
}

const findUsers = async (req,res) => {
    console.log("query params");
    console.log(req.query);
 
    const filtrosUsers = {};
    if (req.query.status !== undefined) {
        if ((req.query.status == 'true')||(req.query.status == 'false')){
            filtrosUsers.status=  JSON.parse(req.query.status);
        }
        else{
            return{
                code:400,
                data:{message:"invalid state"}
            }
        }
    }
    
    if (req.query.name !== undefined) {
        filtrosUsers.name = {[Op.like]: req.query.name };
    }
    console.log("FILTROS users:");
    console.log(filtrosUsers);

    const filtrosSessions = {};

    if (req.query.before ){
        filtrosSessions.createdat = { ...filtrosSessions.createdat,[Op.lt]: new Date(req.query.before) };
    }
  
    if (req.query.after ){
        filtrosSessions.createdat = { ...filtrosSessions.createdat,[Op.gt]: new Date(req.query.after) };
    }
    console.log("FILTROS sessions:");
    console.log(filtrosSessions);

    let var_aux= true
    if (Object.keys(filtrosSessions).length === 0){ //corrije falsos positivos al comparar fechas si es que el usuario está registrado pero nunca ha iniciado sesión
        var_aux = !var_aux;
    }
    console.log(var_aux);
    const usuarios = await db.User.findAll({
        where: filtrosUsers,
        include:[{
            model: db.Session,
            where: filtrosSessions,
            required: var_aux
        }]
     });
    return{
        code:200,
        data: usuarios.map(nombre=>nombre.name)
    }
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}
//const deleteAll = async()=>{
//    await db.User.destroy({truncate: true});
//    await db.Role.destroy({truncate: true});
//    await db.Session.destroy({truncate: true});
//    return {
//        code: 200,
//        message: 'Tablas vaciadas'
//    };
//}


export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
//    deleteAll,
    findUsers,
    bulkCreate
}