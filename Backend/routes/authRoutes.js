import express from 'express';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';

dotenv.config();
const router = express.Router();

// 🚀 REGISTRO DE USUARIO
router.post(
  '/register',
  [
    check('email')
      .isEmail()
      .withMessage('Correo electrónico inválido')
      .normalizeEmail(),
    check('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/\d/)
      .withMessage('La contraseña debe contener al menos un número')
      .matches(/[A-Z]/)
      .withMessage('La contraseña debe contener al menos una letra mayúscula'),
    check('name')
      .notEmpty()
      .withMessage('El nombre es obligatorio')
      .isLength({ min: 2 })
      .withMessage('El nombre debe tener al menos 2 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
          msg: err.msg,
          param: err.param,
        })),
      });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    try {
      // Comprobamos si ya existe un usuario con el mismo correo
      const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertamos el nuevo usuario
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, normalizedEmail, hashedPassword, 'user']
      );
      console.log('Resultado de la inserción:', result); 

      // Verificar si se insertó correctamente
      if (result && result.affectedRows > 0) {
        const newUser = {
          id: result.insertId,
          name,
          email: normalizedEmail,
          role: 'user',
        };

        return res.status(201).json({
          message: 'Usuario registrado correctamente',
          user: newUser,
        });
      } else {
        console.error('Error inesperado: No se insertó el usuario correctamente.');
        return res.status(500).json({ message: 'No se pudo insertar el usuario en la base de datos' });
      }
    } catch (error) {
      console.error('Error en /register:', error);
      return res.status(500).json({ message: 'Error en el servidor al registrar el usuario', error: error.message });
    }
  }
);

// 🚀 INICIO DE SESIÓN (LOGIN)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    // Comprobamos si existe el usuario
    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comprobamos si las contraseñas coinciden
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generamos el token JWT
    const token = jwt.sign(
      { id: user[0].id, role: user[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

export default router;
