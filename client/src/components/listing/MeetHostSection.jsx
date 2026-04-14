import { getUserDisplayName, getUserInitial } from "../../utils/userDisplay";

export default function MeetHostSection({ hostProfile }) {
  if (!hostProfile?.host) return null;

  const host = hostProfile.host;
  const stats = hostProfile.stats || {};

  const hostName = getUserDisplayName(host);
  const hostInitial = getUserInitial(host);
  const joinedDate = host.joinedAt
    ? new Date(host.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "-";

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold">Meet your host</h2>

      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-2xl font-semibold">
              {hostInitial}
            </div>

            <div>
              <p className="text-2xl font-semibold leading-tight">{hostName}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Joined TravelUp in {joinedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
            <div>
              <p className="text-2xl font-semibold">{stats.totalReviews || 0}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.averageRating || 0}⭐</p>
              <p className="text-zinc-500 dark:text-zinc-400">Overall rating</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.totalListings || 0}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Listings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
