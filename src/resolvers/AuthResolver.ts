import bcrypt from 'bcryptjs';
import { Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';

import { User } from '../entities/User';
import * as Types from '../graphql-types/AuthResolverTypes';
import { MyContext } from '../graphql-types/MyContext';

const invalidLoginResponse = {
	errors: [
		{
			path: 'email',
			message: 'Invalid login',
		},
	],
};

@Resolver()
export class AuthResolver {
	@Mutation(() => Types.UserResponse)
	async register(
		@Arg('input')
		{ email, password }: Types.AuthInput
	): Promise<Types.UserResponse> {
		const existingUser = await User.findOne({ email });

		if (existingUser)
			return {
				errors: [
					{
						path: 'email',
						message: 'Already in use',
					},
				],
			};

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			email,
			password: hashedPassword,
		}).save();

		return { user };
	}

	@Mutation(() => Types.UserResponse)
	async login(
		@Arg('input') { email, password }: Types.AuthInput,
		@Ctx() ctx: MyContext
	): Promise<Types.UserResponse> {
		const user = await User.findOne({ where: { email } });

		if (!user) return invalidLoginResponse;

		const valid = await bcrypt.compare(password, user.password);

		if (!valid) return invalidLoginResponse;

		(ctx.req.session as any).userId = user.id;

		return { user };
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
		if (!(ctx.req.session as any).userId) return undefined;

		return User.findOne((ctx.req.session as any).userId);
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
		return new Promise((res, rej) =>
			ctx.req.session!.destroy((err) => {
				if (err) {
					console.log(err);
					return rej(false);
				}

				ctx.res.clearCookie('qid');
				return res(true);
			})
		);
	}
}
