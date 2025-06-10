import { logger } from "@/lib/winston";
import User from "@/models/user";
import { Request, Response } from "express";

const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {

  const userId = req.userId;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    website,
    facebook,
    instagram,
    linkedin,
    x,
    youtube
  } = req.body;

  try {
    
    const user = await User
      .findById(userId)           // Buscamos el usuario en la BD
      .select('+password -__v')   // Excluimos el campo __v del objeto y agregamos el password
      .exec();                    // Ejecutamos la consulta en la BD

    if (!user) {
      res.status(404).json({
        code: 'UserNotFound',
        message: 'User not found'
      })
      return;
    }

    // Actualizamos los campos del usuario con los nuevos valores

    if(username) user.username = username;
    if(email) user.email = email;
    if(password) user.password = password;
    if(first_name) user.firstName = first_name;
    if(last_name) user.lastName = last_name;
    if(!user.socialLinks){
      user.socialLinks = {}
    }

    if(website) user.socialLinks.website = website;
    if(facebook) user.socialLinks.facebook = facebook;
    if(instagram) user.socialLinks.instagram = instagram;
    if(linkedin) user.socialLinks.linkedin = linkedin;
    if(x) user.socialLinks.x = x;
    if(youtube) user.socialLinks.youtube = youtube;

    await user.save(); // Guardamos los cambios en la BD

    logger.info(`User ${userId} updated`, user);

    res.status(200).json({
      user
    });

    res.status(200).json({
      user
    });

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while update current user', error)
  }
}

export { updateCurrentUser };



