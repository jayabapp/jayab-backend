import { UserRole } from 'src/common/interfaces/role.enum';
import { SHA1 } from 'crypto-js';

const createTopicKey = (id: number, role: UserRole) => {
  return SHA1(`${id}::${role}::jayabdsfj732d&kUDu`).toString();
};

export default createTopicKey;
