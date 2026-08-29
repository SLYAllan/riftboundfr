export function libelleAdminDiscord(user: { id: string; username: string; discordName: string | null }): string {
  return user.discordName ?? user.username ?? user.id;
}
