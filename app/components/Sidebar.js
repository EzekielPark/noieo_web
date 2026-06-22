export default function Sidebar({ totalPosts, totalComments }) {
  return (
    <div className="sidebar-panel glass-panel">
      <div className="card-stack">
        <div className="side-card">
          <div className="card-copy">
            <h3>Board Notes</h3>
            <p>
              NOIEO is now focused on a clean, general-purpose board. Browse, post,
              edit, and comment from the same responsive layout.
            </p>
          </div>
        </div>
        <div className="side-card">
          <div className="card-copy">
            <h4>Quick Rules</h4>
            <p>Use a 4-digit password when writing so you can edit or remove the post later.</p>
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="side-note">Posts</span>
          <strong>{totalPosts}</strong>
        </div>
        <div className="stat-card">
          <span className="side-note">Comments</span>
          <strong>{totalComments}</strong>
        </div>
      </div>
    </div>
  );
}
