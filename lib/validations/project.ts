import { z } from 'zod';


export const projectBodySchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, 'Project name cannot be empty')
    .max(200, 'Project name must be 200 characters or less'),
  description: z
    .string({ required_error: 'Project description is required' })
    .min(1, 'Project description cannot be empty')
    .max(2000, 'Project description must be 2000 characters or less'),
  link: z
    .string({ required_error: 'Project link is required' })
    .url('Project link must be a valid URL'),
});


export const projectPostSchema = z.union([
  projectBodySchema,
  z.array(projectBodySchema).min(1, 'At least one project is required'),
]);


export type ProjectBody = z.infer<typeof projectBodySchema>;
export type ProjectPostPayload = z.infer<typeof projectPostSchema>;
