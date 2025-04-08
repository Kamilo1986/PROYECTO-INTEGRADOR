import { check, validationResult } from 'express-validator';

// Función para obtener usuarios
export const getUsuarios = (req, res) => {
    // Aquí se simula la obtención de usuarios desde una base de datos
    const usuarios = [
        { nombre: "Juan", edad: 30 },
        { nombre: "Ana", edad: 25 },
        { nombre: "Pedro", edad: 35 }
    ];

    res.status(200).json(usuarios);  // Responde con el array de usuarios
};

// Función para crear un usuario
export const createUsuarios = [
    // Validación de los campos
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('correo').isEmail().withMessage('El correo no es válido'),

    // Lógica para manejar la creación de un usuario
    async (req, res) => {
        const errors = validationResult(req);  // Verificar si hay errores
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });  // Enviar los errores de validación
        }

        const { nombre, correo } = req.body;

        // Crear un usuario de ejemplo (En la vida real, guardas esto en una base de datos)
        const nuevoUsuario = {
            id: 10,  // Este ID debe ser generado por la base de datos en un sistema real
            nombre: nombre,
            correo: correo
        };

        // Responder con el nuevo usuario creado
        return res.status(201).json({
            message: "Usuario creado correctamente",
            usuario: nuevoUsuario
        });
    }
];
