

import { genSlug } from '@/utils';
import { Schema, model, Types } from 'mongoose';



export interface IBlog {
  title: string;
  slug: string;
  content: string;
  banner:{
    publicId: string;
    url: string;
    width: number;
    height: number;
  }
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: 'draft' | 'published';
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxLength: [180, 'Title must be at least 180 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: [true, 'Slug must be unique'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    banner: {
      publicId: {
        type: String,
        required: [true, 'Banner public ID is required'],
      },
      url: {
        type: String,
        required: [true, 'Banner url is required'],
      },
      width: {
        type: Number,
        required: [true, 'Banner withd is required'],
      },
      height: {
        type: Number,
        required: [true, 'Banner height is required'],
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not supported',
      },
      default: 'draft'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
    }
  }
);

blogSchema.pre('validate', function (next) {   // Antes de guardaro o actualiar un documento, se ejecuta este método
  if(this.title && !this.slug){                // Si existe un título pero no un slug
    this.slug = genSlug(this.title);           // genera un slug aleatorio
  }
  next()
})

export default model<IBlog>('Blog', blogSchema);

