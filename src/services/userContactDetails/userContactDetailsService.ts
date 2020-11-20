
import { Repository } from 'typeorm';
import { UserContactDetails } from '../../db/entity';
import { injectable, inject } from 'inversify';
import { UserContactDetailsRepository } from '../../repositories';
import { TYPES } from '../../types';

export interface UserContactDetailsServiceInterface {
    getContactDetailsForUser: (userId: string) => Promise<UserContactDetails|undefined>;
    save: (details: UserContactDetails) => Promise<void>;
}

@injectable()
export class UserContactDetailsService implements UserContactDetailsServiceInterface {
    private readonly contactDetailsRepo: Repository<UserContactDetails>;

	public constructor(@inject(TYPES.UserContactDetailsRepository) contactDetailsRepo: UserContactDetailsRepository) {
		this.contactDetailsRepo = contactDetailsRepo.getRepository();
	}

    public getContactDetailsForUser = async (userId: string): Promise<UserContactDetails|undefined> =>  {
        return await this.contactDetailsRepo.findOne(userId);
    }

    public save = async (details: UserContactDetails): Promise<void> =>  {
        await this.contactDetailsRepo.save(details);
    }
}
