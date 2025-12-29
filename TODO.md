# Avatar Update Issue Fix

## Completed Tasks

- [x] Analyze the avatar update flow: UserAvatar uploads to Cloudinary, updates DB via updateAvatar, revalidates path
- [x] Identify issue: NextAuth session not including image field, causing old avatar to show on reload
- [x] Update src/libs/auth.ts to include image in JWT and session callbacks
- [x] Update src/views/pages/profile/left-overview/UserAvatar.tsx to call session.update() after DB update

## Followup Steps

- [ ] Test the changes by uploading an avatar and reloading the page to verify the fix
