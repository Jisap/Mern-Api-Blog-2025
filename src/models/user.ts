import { model, Schema } from "mongoose";
import bcrypt from 'bcrypt';

export interface IUser { // IUser es para la verificación de tipos en tiempo de desarrollo con TypeScript.
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

const userSchema = new Schema<IUser>( // User es para la interacción con la base de datos en tiempo de ejecución con Mongoose.
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      maxLength: [20, 'Username must be at least 20 characters'],
      unique: [true, 'Username must be unique'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email must be at least 50 characters'],
      unique: [true, 'Email must be unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not supported',
      },
      default: 'user',
    },
    firstName:{
      type: String,
      maxLength: [20, 'First name must be at least 20 characters'],
    },
    lastName:{
      type: String,
      maxLength: [20, 'Last name must be at least 20 characters'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website must be at least 100 characters'],
      },
      facebook: {
        type: String,
        maxLength: [100, 'Facebook must be at least 100 characters'],
      },
      instagram: {
        type: String,
        maxLength: [100, 'Instagram must be at least 100 characters'],
      },
      linkedin: {
        type: String,
        maxLength: [100, 'Linkedin must be at least 100 characters'],
      },
      x: {
        type: String,
        maxLength: [100, 'X must be at least 100 characters'],
      },
      youtube: {
        type: String,
        maxLength: [100, 'Youtube must be at least 100 characters'],
      },
    }
  },{
    timestamps: true,
  },
)

// Esto define una función que Mongoose ejecutará antes de que un documento de usuario se guarde
// en la base de datos (ya sea al crear un nuevo usuario o al actualizar uno existente).

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {                        // "Si la contraseña no ha sido modificada, entonces sáltate el hashing y simplemente llama a next()"
    next();
    return
  }

  this.password = await bcrypt.hash(this.password, 10);      // Si la contraseña sí fue modificada, la condición es falsa, y el código procederá a hashear la contraseña.
  next()
})

export default model<IUser>('User', userSchema);