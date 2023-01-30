import * as DataLoader from "dataloader";
import {UserEntity} from "../../utils/DB/entities/DBUsers";
import {PostEntity} from "../../utils/DB/entities/DBPosts";
import {ProfileEntity} from "../../utils/DB/entities/DBProfiles";
import {MemberTypeEntity} from "../../utils/DB/entities/DBMemberTypes";

type Loaders = {
  userById: DataLoader<string, UserEntity>;
  usersBySubscribedToUserIds: DataLoader<string, UserEntity[]>;
  postsByUserId: DataLoader<string, PostEntity[]>;
  profilesByUserId: DataLoader<string, ProfileEntity[]>;
  memberTypeById: DataLoader<string, MemberTypeEntity>;
  populateUserCache: (users: UserEntity[]) => void;
  populateMemberTypeCache: (memberTypes: MemberTypeEntity[]) => void;
}

export { Loaders };
