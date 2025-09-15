import React, { useEffect, useRef, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import axios from "axios";

const RecentSubmission = ({ scope = "teacher", limit = 3 }) => {
  const [items, setItems] = useState([]); // unified papers+proposals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didFetch = useRef(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const FILE_BASE = import.meta.env.VITE_FILE_BASE || "http://localhost:8000";

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const endpoints =
    scope === "student"
      ? {
          papers: `${API_BASE}/student/my-teams/papers`,
          proposals: `${API_BASE}/student/my-teams/proposals`,
        }
      : {
          papers: `${API_BASE}/teacher/my-teams/papers`,
          proposals: `${API_BASE}/teacher/my-teams/proposals`,
        };

  useEffect(() => {
    if (didFetch.current) return; // avoid StrictMode double-fire in dev
    didFetch.current = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pr, por] = await Promise.all([
          axios.get(endpoints.papers, { headers, withCredentials: true }),
          axios.get(endpoints.proposals, { headers, withCredentials: true }),
        ]);

        const toUnified = (arr, type) =>
          (arr || []).map((x) => ({
            id: type === "paper" ? x.paper_id : x.proposal_id,
            title: x.title,
            team: x.team?.team_name || "Unknown Team",
            created_at: x.created_at,
            status: x.status, // PENDING | UNDER_REVIEW | COMPLETED
            aggregated_decision: x.aggregated_decision || null, // ACCEPT | REJECT | MINOR_REVISIONS | MAJOR_REVISIONS
            aggregated_decided_at: x.aggregated_decided_at || null,
            type, // 'paper' | 'proposal'
            download_url:
              x.download_url || (x.pdf_path ? `${FILE_BASE}/${x.pdf_path}` : null),
          }));

        const unified = [
          ...toUnified(pr.data?.data || [], "paper"),
          ...toUnified(por.data?.data || [], "proposal"),
        ]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit);

        setItems(unified);
      } catch (err) {
        console.error("Error fetching recent submissions:", err);
        setError("Failed to load recent submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [endpoints.papers, endpoints.proposals]);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? "1 minute ago" : `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    return months <= 1 ? "1 month ago" : `${months} months ago`;
  };

  // Workflow status: PENDING | UNDER_REVIEW | COMPLETED
  const toDisplayStatus = (s) => {
    const map = {
      PENDING: "Pending Review",
      UNDER_REVIEW: "Under Review",
      COMPLETED: "Completed Review",
    };
    return map[(s || "").toUpperCase()] || s || "Unknown";
  };

  const statusClass = (displayStatus) => {
    switch (displayStatus) {
      case "Under Review":
        return "bg-yellow-100 text-yellow-700";
      case "Completed Review":
        return "bg-green-100 text-green-700";
      case "Pending Review":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Final decision badge (when aggregated_decision exists)
  const toDisplayDecision = (d) => {
    if (!d) return null;
    const map = {
      ACCEPT: "Accepted",
      REJECT: "Rejected",
      MINOR_REVISIONS: "Minor Revisions",
      MAJOR_REVISIONS: "Major Revisions",
    };
    return map[(d || "").toUpperCase()] || d;
  };

  const decisionClass = (displayDecision) => {
    switch (displayDecision) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Minor Revisions":
        return "bg-orange-100 text-orange-700";
      case "Major Revisions":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleView = async (item) => {
    if (!item.download_url) {
      alert("No PDF file available for this submission");
      return;
    }
    try {
      const head = await fetch(item.download_url, { method: "HEAD", headers });
      if (head.ok) window.open(item.download_url, "_blank");
      else if (head.status === 429) alert("Too many requests. Try again shortly.");
      else window.open(item.download_url, "_blank"); // fallback
    } catch {
      window.open(item.download_url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading papers...</p>
      </div>
    );
  }
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md flex-1">
      <h3 className="font-bold text-lg mb-4">Recent Submissions</h3>

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent submissions found
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => {
                const displayStatus = toDisplayStatus(it.status);
                const displayDecision = toDisplayDecision(it.aggregated_decision);
                const timeAgo = getTimeAgo(it.created_at);

                return (
                  <li
                    key={`${it.type}-${it.id}`}
                    className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium" title={it.title}>
                        {it.title?.length > 40 ? `${it.title.slice(0, 40)}...` : it.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {it.type === "paper" ? "Paper" : "Proposal"} • {it.team} • {timeAgo}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Workflow status */}
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClass(displayStatus)}`}>
                        {displayStatus}
                      </span>

                      {/* Final decision (if aggregated) */}
                      {displayDecision && (
                        <span className={`text-xs px-2 py-1 rounded-full ${decisionClass(displayDecision)}`}>
                          {displayDecision}
                        </span>
                      )}

                      <button
                        className="p-2 rounded-md hover:bg-gray-100"
                        title={`View ${it.title}`}
                        onClick={() => handleView(it)}
                      >
                        <FaRegEye className="text-gray-600" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default RecentSubmission;
