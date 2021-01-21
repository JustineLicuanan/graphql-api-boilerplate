import { InputType, Field, ObjectType } from 'type-graphql';

import { FieldError } from './FieldError';
import { User } from '../entities/User';

@InputType()
export class AuthInput {
	@Field()
	email: string;

	@Field()
	password: string;
}

@ObjectType()
export class UserResponse {
	@Field(() => User, { nullable: true })
	user?: User;

	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
}
