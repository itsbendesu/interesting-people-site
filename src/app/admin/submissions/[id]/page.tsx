"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

interface Submission {
  id: string;
  status: string;
  videoUrl: string;
  videoDurationSec: number;
  createdAt: string;
  averageScore: number | null;
  applicant: {
    name: string;
    email: string;
    phone: string;
    ticketType: string;
    scholarshipAmount: string | null;
    address: string | null;
    timezone: string;
    bio: string;
    links: string[] | null;
  };
  prompt: {
    text: string;
  };
  reviews: Array<{
    id: string;
    curiosityVsEgo: number;
    participationVsSpectatorship: number;
    emotionalIntelligence: number;
    notes: string | null;
    createdAt: string;
    reviewer: { id: string; name: string | null; email: string };
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700 border-gray-300",
  ACCEPTED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
  WAITLIST: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const RUBRIC_LABELS = {
  curiosityVsEgo: {
    name: "Curiosity vs Ego",
    low: "Ego-driven",
    high: "Genuine curiosity",
    description: "Does this person ask questions to learn, or to show off what they know?",
  },
  participationVsSpectatorship: {
    name: "Participation vs Spectatorship",
    low: "Passive observer",
    high: "Active participant",
    description: "Do they make things happen, or wait for others to lead?",
  },
  emotionalIntelligence: {
    name: "Emotional Intelligence",
    low: "Low EQ",
    high: "High EQ",
    description: "Can they read the room and connect authentically?",
  },
};

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    curiosityVsEgo: 3,
    participationVsSpectatorship: 3,
    emotionalIntelligence: 3,
    notes: "",
  });

  const [hasExistingReview, setHasExistingReview] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    if (!data.isLoggedIn) {
      router.push("/admin/login");
      return null;
    }
    setReviewerId(data.reviewerId);
    setIsAdmin(data.role === "ADMIN");
    return data;
  }, [router]);

  const fetchSubmission = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/submissions/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubmission(data);

      // Pre-fill form if current reviewer already reviewed
      if (reviewerId) {
        const existingReview = data.reviews.find(
          (r: Submission["reviews"][0]) => r.reviewer.id === reviewerId
        );
        if (existingReview) {
          setReviewForm({
            curiosityVsEgo: existingReview.curiosityVsEgo,
            participationVsSpectatorship: existingReview.participationVsSpectatorship,
            emotionalIntelligence: existingReview.emotionalIntelligence,
            notes: existingReview.notes || "",
          });
          setHasExistingReview(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch submission:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, reviewerId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (reviewerId) {
      fetchSubmission();
    }
  }, [reviewerId, fetchSubmission]);

  const handleSubmitReview = async () => {
    if (!submission) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          ...reviewForm,
          notes: reviewForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setHasExistingReview(true);
      await fetchSubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!submission || !isAdmin) return;
    setStatusUpdating(newStatus);
    setError(null);

    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      await fetchSubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-gray-900";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Submission not found</p>
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const links = submission.applicant.links || [];
  const myReviewScore =
    (reviewForm.curiosityVsEgo +
      reviewForm.participationVsSpectatorship +
      reviewForm.emotionalIntelligence) /
    3;

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-700 min-h-[44px] -ml-2 px-2 inline-flex items-center shrink-0"
            >
              &larr; Back
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{submission.applicant.name}</h1>
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border shrink-0 ${STATUS_COLORS[submission.status]}`}
            >
              {submission.status}
            </span>
          </div>

          {/* One-click decision buttons for admins */}
          {isAdmin && (
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2">
              <button
                onClick={() => handleStatusChange("ACCEPTED")}
                disabled={submission.status === "ACCEPTED" || statusUpdating !== null}
                className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  submission.status === "ACCEPTED"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {statusUpdating === "ACCEPTED" ? "..." : "Accept"}
              </button>
              <button
                onClick={() => handleStatusChange("WAITLIST")}
                disabled={submission.status === "WAITLIST" || statusUpdating !== null}
                className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  submission.status === "WAITLIST"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                {statusUpdating === "WAITLIST" ? "..." : "Waitlist"}
              </button>
              <button
                onClick={() => handleStatusChange("REJECTED")}
                disabled={submission.status === "REJECTED" || statusUpdating !== null}
                className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  submission.status === "REJECTED"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {statusUpdating === "REJECTED" ? "..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-32 lg:pb-8">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left column - Video and prompt */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="font-medium text-gray-900 mb-2">Prompt</h2>
              <p className="text-gray-700 italic text-base sm:text-lg">&ldquo;{submission.prompt.text}&rdquo;</p>
            </div>

            {submission.videoUrl === "friend-invite" ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Friend Invite
                  </span>
                  <p className="text-sm text-blue-600">
                    Invited by Andrew — no video application required
                  </p>
                </div>
                {submission.applicant.scholarshipAmount && (
                  <p className="text-sm text-gray-600 mt-3">
                    Chosen price: <span className="font-medium">{submission.applicant.scholarshipAmount}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="font-medium text-gray-900">Video Response</h2>
                  <span className="text-sm text-gray-500">
                    {submission.videoDurationSec}s
                  </span>
                </div>
                <VideoPlayer src={submission.videoUrl} className="aspect-video rounded-lg overflow-hidden w-full" />
              </div>
            )}

            {/* Applicant Info */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="font-medium text-gray-900 mb-4">Applicant Info</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${submission.applicant.email}`}
                      className="text-indigo-600 hover:text-indigo-700 break-all"
                    >
                      {submission.applicant.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied</p>
                    <p className="text-gray-900">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${submission.applicant.phone}`} className="text-gray-900 hover:text-indigo-600">
                      {submission.applicant.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ticket Type</p>
                    <p className="text-gray-900 capitalize">{submission.applicant.ticketType === "scholarship" ? "Pay What You Can" : submission.applicant.ticketType}</p>
                  </div>
                </div>

                {submission.applicant.ticketType === "scholarship" && submission.applicant.scholarshipAmount && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-gray-500">Can afford to pay</p>
                    <p className="text-gray-900 font-medium">{submission.applicant.scholarshipAmount}</p>
                  </div>
                )}

                {submission.applicant.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{submission.applicant.address}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Timezone</p>
                  <p className="text-gray-900">{submission.applicant.timezone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-900">{submission.applicant.bio}</p>
                </div>

                {links.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Links</p>
                    <ul className="space-y-1">
                      {links.map((link: string, i: number) => (
                        <li key={i}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 text-sm break-all"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Review form and other reviews */}
          <div className="space-y-4 sm:space-y-6">
            {/* Score Summary */}
            {submission.averageScore !== null && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-gray-900">Overall Score</h2>
                  <div className="text-right">
                    <span className={`text-3xl font-bold ${getScoreColor(submission.averageScore)}`}>
                      {submission.averageScore.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-lg">/5</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {submission.reviews.length} review{submission.reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Review Form */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="font-medium text-gray-900">
                  {hasExistingReview ? "Update Your Review" : "Add Your Review"}
                </h2>
                <div className="text-right">
                  <span className={`text-xl font-bold ${getScoreColor(myReviewScore)}`}>
                    {myReviewScore.toFixed(1)}
                  </span>
                  <span className="text-gray-400">/5</span>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Rubric Sliders */}
                {(
                  Object.entries(RUBRIC_LABELS) as [
                    keyof typeof RUBRIC_LABELS,
                    (typeof RUBRIC_LABELS)[keyof typeof RUBRIC_LABELS]
                  ][]
                ).map(([key, rubric]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-900">
                        {rubric.name}
                      </label>
                      <span
                        className={`text-2xl font-bold ${getScoreColor(reviewForm[key])}`}
                      >
                        {reviewForm[key]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{rubric.description}</p>

                    {/* Touch-friendly button picker (mobile) */}
                    <div className="grid grid-cols-5 gap-1.5 sm:hidden mb-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() =>
                            setReviewForm((f) => ({ ...f, [key]: n }))
                          }
                          className={`min-h-[44px] rounded-lg text-base font-semibold transition-colors ${
                            reviewForm[key] === n
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          aria-label={`${rubric.name}: ${n}`}
                          aria-pressed={reviewForm[key] === n}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    {/* Slider (desktop) */}
                    <div className="relative hidden sm:block">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={reviewForm[key]}
                        onChange={(e) =>
                          setReviewForm((f) => ({ ...f, [key]: parseInt(e.target.value) }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        aria-label={rubric.name}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{rubric.low}</span>
                      <span>{rubric.high}</span>
                    </div>
                  </div>
                ))}

                <div>
                  <label htmlFor="review-notes" className="block text-sm font-medium text-gray-900 mb-2">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="review-notes"
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Private notes about this applicant..."
                  />
                </div>

                {/* Save button — hidden on mobile (uses sticky bottom version below) */}
                <button
                  onClick={handleSubmitReview}
                  disabled={saving}
                  className="hidden lg:block w-full py-3 min-h-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {saving ? "Saving..." : hasExistingReview ? "Update Review" : "Save Review"}
                </button>
              </div>
            </div>

            {/* Previous reviews */}
            {submission.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="font-medium text-gray-900 mb-4">
                  All Reviews ({submission.reviews.length})
                </h2>
                <div className="space-y-4">
                  {submission.reviews.map((review) => {
                    const avgScore = (
                      (review.curiosityVsEgo +
                        review.participationVsSpectatorship +
                        review.emotionalIntelligence) /
                      3
                    );
                    const isMyReview = review.reviewer.id === reviewerId;

                    return (
                      <div
                        key={review.id}
                        className={`border rounded-lg p-3 sm:p-4 ${
                          isMyReview ? "border-indigo-200 bg-indigo-50" : "border-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {review.reviewer.name || review.reviewer.email}
                              {isMyReview && (
                                <span className="ml-2 text-xs text-indigo-600">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-lg font-bold shrink-0 ${getScoreColor(avgScore)}`}>
                            {avgScore.toFixed(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Curiosity</p>
                            <p className={`font-medium ${getScoreColor(review.curiosityVsEgo)}`}>
                              {review.curiosityVsEgo}/5
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Participation</p>
                            <p className={`font-medium ${getScoreColor(review.participationVsSpectatorship)}`}>
                              {review.participationVsSpectatorship}/5
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">EQ</p>
                            <p className={`font-medium ${getScoreColor(review.emotionalIntelligence)}`}>
                              {review.emotionalIntelligence}/5
                            </p>
                          </div>
                        </div>

                        {review.notes && (
                          <p className="text-gray-600 text-sm mt-3 italic border-t pt-3">
                            {review.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky save button on mobile/tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="text-right shrink-0">
            <div className={`text-xl font-bold leading-tight ${getScoreColor(myReviewScore)}`}>
              {myReviewScore.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Your score</div>
          </div>
          <button
            onClick={handleSubmitReview}
            disabled={saving}
            className="flex-1 py-3 min-h-[48px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-base"
          >
            {saving ? "Saving..." : hasExistingReview ? "Update Review" : "Save Review"}
          </button>
        </div>
      </div>
    </main>
  );
}
