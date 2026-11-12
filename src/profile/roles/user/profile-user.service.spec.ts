import { BadRequestException, ConflictException } from '@nestjs/common';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { ProfileUserService } from './profile-user.service';

const dto = { full_name: 'علی رضایی', national_code: '0603400000', selfie_image_id: 7 };

const buildService = (state: { userOwnerId?: number | null; owners?: any[]; ownerById?: any }) => {
  const tx = {
    $executeRaw: jest.fn().mockResolvedValue(1),
    user: {
      findUnique: jest.fn().mockResolvedValue({ owner_id: state.userOwnerId ?? null }),
      update: jest.fn().mockResolvedValue({}),
    },
    owner: {
      findUnique: jest.fn().mockResolvedValue(state.ownerById ?? null),
      findMany: jest.fn().mockResolvedValue(state.owners ?? []),
      create: jest.fn().mockImplementation(async ({ data }) => ({ id: 50, ...data })),
      update: jest.fn().mockImplementation(async ({ where, data }) => ({ id: where.id, ...data })),
    },
  };
  const db = { $transaction: jest.fn(async (cb) => cb(tx)) };
  return { tx, service: new ProfileUserService(db as any, null, null) };
};

describe('ProfileUserService.registerOwner', () => {
  it('creates the owner and links it to the user in one transaction', async () => {
    const { service, tx } = buildService({});
    const { owner, changed } = await service.registerOwner(1, { ...dto });

    expect(changed).toBe(true);
    expect(owner.status).toBe(OwnerStatus.PENDING);
    expect(tx.owner.create).toHaveBeenCalledTimes(1);
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { full_name: dto.full_name, profile_image_id: 7, owner_id: 50 },
    });
  });

  it('takes locks for the national code and the user before reading', async () => {
    const { service, tx } = buildService({});
    await service.registerOwner(1, { ...dto });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it('succeeds again when the same user retries with the same national code', async () => {
    const { service, tx } = buildService({
      userOwnerId: 9,
      ownerById: { id: 9, national_code: dto.national_code, status: OwnerStatus.APPROVED },
    });
    const { owner, changed } = await service.registerOwner(1, { ...dto });

    expect(changed).toBe(false);
    expect(owner.id).toBe(9);
    expect(tx.owner.create).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('rejects a user who already owns a different national code', async () => {
    const { service } = buildService({
      userOwnerId: 9,
      ownerById: { id: 9, national_code: '1111111111', status: OwnerStatus.APPROVED },
    });
    await expect(service.registerOwner(1, { ...dto })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reuses an owner row left without a user by an interrupted registration', async () => {
    const { service, tx } = buildService({
      owners: [{ id: 33, national_code: dto.national_code, status: OwnerStatus.PENDING, user: null }],
    });
    const { owner, changed } = await service.registerOwner(1, { ...dto });

    expect(changed).toBe(true);
    expect(owner.id).toBe(33);
    expect(tx.owner.create).not.toHaveBeenCalled();
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { full_name: dto.full_name, profile_image_id: 7, owner_id: 33 },
    });
  });

  it('rejects a national code that belongs to another user', async () => {
    const { service, tx } = buildService({
      owners: [{ id: 33, national_code: dto.national_code, status: OwnerStatus.APPROVED, user: { id: 2 } }],
    });
    await expect(service.registerOwner(1, { ...dto })).rejects.toBeInstanceOf(ConflictException);
    expect(tx.owner.create).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
