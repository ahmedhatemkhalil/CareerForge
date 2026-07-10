import AppearanceCard from './components/AppearanceCard'
import ChangePasswordCard from './components/ChangePasswordCard'
import DeleteAccountCard from './components/DeleteAccountCard'
import ProfileInformationCard from './components/ProfileInformationCard'

const Profile = () => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-2 sm:space-y-8 sm:pb-0">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and preferences
        </p>
      </div>

      <ProfileInformationCard />
      <ChangePasswordCard />
      <AppearanceCard />
      <DeleteAccountCard />
    </div>
  )
}

export default Profile
