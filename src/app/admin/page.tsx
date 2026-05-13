"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ScoringResult {
  averageScore: number | null;
  reviewCount: number;
  confidence: "none" | "low" | "medium" | "high";
  breakdown: {
    curiosityVsEgo: number | null;
    participationVsSpectatorship: number | null;
    emotionalIntelligence: number | null;
  };
}

interface Submission {
  id: string;
  status: string;
  createdAt: string;
  averageScore: number | null;
  scoring: ScoringResult;
  videoUrl: string;
  applicant: {
    name: string;
    email: string;
    location: string;
    ticketType: string;
  };
  prompt: {
    text: string;
  };
  reviews: Array<{
    curiosityVsEgo: number;
    participationVsSpectatorship: number;
    emotionalIntelligence: number;
    reviewer: { name: string | null };
  }>;
}

interface Stats {
  counts: {
    submitted: number;
    accepted: number;
    waitlist: number;
    rejected: number;
    total: number;
  };
  needsReview: number;
  totalReviews: number;
  averageScore: string;
  acceptedCap: number;
  spotsRemaining: number;
}

interface ReviewerUser {
  isLoggedIn: boolean;
  reviewerId?: string;
  name?: string;
  email?: string;
  role?: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITLIST: "bg-yellow-100 text-yellow-700",
};

const STATUS_BUTTON_COLORS: Record<string, string> = {
  all: "bg-indigo-600 text-white",
  SUBMITTED: "bg-gray-600 text-white",
  ACCEPTED: "bg-green-600 text-white",
  WAITLIST: "bg-yellow-600 text-white",
  REJECTED: "bg-red-600 text-white",
};

const CONFIDENCE_BADGES: Record<string, { text: string; className: string }> = {
  none: { text: "No reviews", className: "bg-gray-100 text-gray-600" },
  low: { text: "Low", className: "bg-yellow-100 text-yellow-700" },
  medium: { text: "Med", className: "bg-blue-100 text-blue-700" },
  high: { text: "High", className: "bg-green-100 text-green-700" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ReviewerUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    hasReview: "",
    minScore: "",
    maxScore: "",
    sortBy: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    if (!data.isLoggedIn) {
      router.push("/admin/login");
      return;
    }
    setUser(data);
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        status: filters.status,
        sortBy: filters.sortBy,
      });

      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.hasReview) params.set("hasReview", filters.hasReview);
      if (filters.minScore) params.set("minScore", filters.minScore);
      if (filters.maxScore) params.set("maxScore", filters.maxScore);

      const res = await fetch(`/api/admin/submissions?${params}`);
      const data = await res.json();
      setSubmissions(data.submissions);
      setPagination((p) => ({ ...p, total: data.pagination.total, totalPages: data.pagination.totalPages }));
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchStats();
      fetchSubmissions();
    }
  }, [user, fetchStats, fetchSubmissions]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateFrom: "",
      dateTo: "",
      hasReview: "",
      minScore: "",
      maxScore: "",
      sortBy: "newest",
    });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleExport = async (statusFilter: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?status=${statusFilter}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applicants-${statusFilter.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.hasReview ||
    filters.minScore ||
    filters.maxScore;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-gray-900";
    if (score >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-gray-600 text-sm hidden sm:inline">
              {user.name || user.email}{" "}
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                {user.role}
              </span>
            </span>
            <span className="text-gray-600 text-xs sm:hidden">
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                {user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px] px-2 -mr-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.counts.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Pending Review</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.counts.submitted}</p>
              {stats.needsReview > 0 && (
                <p className="text-xs text-amber-600">{stats.needsReview} unreviewed</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
              <p className="text-xs sm:text-sm text-gray-500">Accepted</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.counts.accepted}</p>
              <p className="text-xs text-gray-500">
                {stats.spotsRemaining} of {stats.acceptedCap} left
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Waitlist</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.counts.waitlist}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Rejected</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.counts.rejected}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Avg Score</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.averageScore}</p>
              <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
            </div>
          </div>
        )}

        {/* Acceptance Progress */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-sm font-medium text-gray-700">Acceptance Progress</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {stats.counts.accepted} / {stats.acceptedCap}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.counts.accepted >= stats.acceptedCap ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (stats.counts.accepted / stats.acceptedCap) * 100)}%` }}
              />
            </div>
            {stats.counts.accepted >= stats.acceptedCap && (
              <p className="text-xs text-red-600 mt-2">Cap reached! New acceptances will be blocked.</p>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-500">Download CSV with applicant contact info</p>
            </div>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => handleExport("ACCEPTED")}
                disabled={exporting}
                className="px-4 py-3 sm:py-2 min-h-[44px] bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium disabled:opacity-50"
              >
                {exporting ? "..." : "Export Accepted"}
              </button>
              <button
                onClick={() => handleExport("WAITLIST")}
                disabled={exporting}
                className="px-4 py-3 sm:py-2 min-h-[44px] bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium disabled:opacity-50"
              >
                {exporting ? "..." : "Export Waitlist"}
              </button>
              <button
                onClick={() => handleExport("ACCEPTED,WAITLIST")}
                disabled={exporting}
                className="px-4 py-3 sm:py-2 min-h-[44px] bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium disabled:opacity-50"
              >
                {exporting ? "..." : "Export Both"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills and Sort */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="-mx-4 px-4 overflow-x-auto lg:overflow-visible lg:mx-0 lg:px-0">
            <div className="flex gap-2 min-w-max lg:min-w-0 lg:flex-wrap">
              {["all", "SUBMITTED", "ACCEPTED", "WAITLIST", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange("status", status)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filters.status === status
                      ? STATUS_BUTTON_COLORS[status]
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status}
                  {stats && status !== "all" && (
                    <span className="ml-1 opacity-75">
                      ({stats.counts[status.toLowerCase() as keyof typeof stats.counts]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="flex-1 sm:flex-initial min-w-0 px-3 py-2 min-h-[44px] border border-gray-200 rounded-lg text-base sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_score">Highest Score</option>
              <option value="lowest_score">Lowest Score</option>
              <option value="needs_review">Needs Review</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
              </span>
            </button>
            <p className="text-gray-600 text-sm w-full sm:w-auto">
              {pagination.total} submission{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Has Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Status
                </label>
                <select
                  value={filters.hasReview}
                  onChange={(e) => handleFilterChange("hasReview", e.target.value)}
                  className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  <option value="true">Has Reviews</option>
                  <option value="false">No Reviews</option>
                </select>
              </div>

              {/* Score Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="Min"
                    value={filters.minScore}
                    onChange={(e) => handleFilterChange("minScore", e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="Max"
                    value={filters.maxScore}
                    onChange={(e) => handleFilterChange("maxScore", e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 min-h-[44px]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submissions Table */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No submissions found.
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {submissions.map((sub) => {
                const score = sub.scoring?.averageScore ?? sub.averageScore;
                const confidence = sub.scoring?.confidence ?? "none";
                const reviewCount = sub.scoring?.reviewCount ?? sub.reviews.length;
                const badge = CONFIDENCE_BADGES[confidence];

                return (
                  <Link
                    key={sub.id}
                    href={`/admin/submissions/${sub.id}`}
                    className="block bg-white rounded-xl shadow-sm p-4 active:bg-gray-50"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{sub.applicant.name}</span>
                          {sub.applicant.ticketType?.startsWith("friends-") && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Friend
                            </span>
                          )}
                          {sub.applicant.ticketType === "alumni" && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                              Alumni
                            </span>
                          )}
                          {sub.applicant.ticketType === "alumni-friend" && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
                              Alumni·Friend
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{sub.applicant.email}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-bold leading-tight ${getScoreColor(score)}`}>
                          {score !== null ? score.toFixed(1) : "-"}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">Score</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${STATUS_COLORS[sub.status]}`}
                      >
                        {sub.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${badge.className}`}
                        title={`${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
                      >
                        {badge.text}
                      </span>
                      {sub.applicant.location && (
                        <span className="text-gray-600 truncate">{sub.applicant.location}</span>
                      )}
                      <span className="text-gray-400 ml-auto">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((sub) => {
                      const score = sub.scoring?.averageScore ?? sub.averageScore;
                      const confidence = sub.scoring?.confidence ?? "none";
                      const reviewCount = sub.scoring?.reviewCount ?? sub.reviews.length;
                      const badge = CONFIDENCE_BADGES[confidence];

                      return (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {sub.applicant.name}
                              {sub.applicant.ticketType?.startsWith("friends-") && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  Friend
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{sub.applicant.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{sub.applicant.location}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status]}`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold ${getScoreColor(score)}`}>
                              {score !== null ? score.toFixed(1) : "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                              title={`${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/submissions/${sub.id}`}
                              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
