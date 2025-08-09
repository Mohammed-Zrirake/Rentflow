import { User } from '@rentflow/database';
export type ApiUser = Omit<User, 'password'>;
