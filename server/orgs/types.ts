export type Destination = 'pending' | 'accepted';
export type Pool = { kind: Destination; ordinal: number; operationId: string; organizationId: string | null; state: 'creating' | 'ready' | 'needs-review' | 'failed' };
export type Operation = { id: string; kind: 'member' | 'invitation'; destination: Destination; organizationId: string | null; phase: 'planned' | 'submitted' | 'needs-review' | 'complete'; userId?: string; email?: string };
export interface OrganizationStore {
  list(): Promise<Pool[]>;
  acquire(): Promise<string | null>;
  fence(token: string): Promise<void>;
  release(token: string): Promise<void>;
  savePool(row: Pool, token: string): Promise<void>;
  getOperation(key: string): Promise<Operation | null>;
  saveOperation(key: string, operation: Operation, token: string): Promise<void>;
  seed(rows: Pool[], token: string): Promise<void>;
}
export type User = { id: string; name: string; verifiedEmails: string[] };
export type Member = { userId: string; name: string; identifier: string; joinedAt: number };
export type Invitation = { id: string; email: string; createdAt: number; expiresAt: number; metadata: Record<string, unknown> };
export type Organization = { id: string; name: string; limit: number; metadata: Record<string, unknown> };
export interface OrganizationGateway {
  instance(): Promise<{ id: string; environmentType: string }>;
  organization(id: string): Promise<Organization>;
  seatUsage(id: string): Promise<{ limit: number; members: number; invitations: number }>;
  organizations(): Promise<Organization[]>;
  members(id: string): Promise<Member[]>;
  invitations(id: string): Promise<Invitation[]>;
  user(id: string): Promise<User>;
  findUser(email: string): Promise<User | null>;
  userMemberships(id: string): Promise<string[]>;
  createOrganization(kind: Destination, ordinal: number, metadata: Record<string, unknown>): Promise<string>;
  addMember(organizationId: string, userId: string): Promise<void>;
  removeMember(organizationId: string, userId: string): Promise<void>;
  invite(organizationId: string, email: string, metadata: Record<string, unknown>): Promise<void>;
  revokeInvitation(organizationId: string, id: string): Promise<void>;
}
export type PoolConfiguration = { instanceId: string; teamId: string; pendingId: string; acceptedId: string; rollover: boolean };
export class OrganizationProblem extends Error {
  constructor(public readonly state: string, public readonly status = 503) { super(state); }
}
export type Result = { state: 'added' | 'invited' | 'already-member' | 'already-accepted' | 'already-invited' | 'cleanup-needed'; destination: Destination };
export type Page<T> = { data: T[]; totalCount: number; offset: number; nextCursor: string | null; previousCursor: string | null };
