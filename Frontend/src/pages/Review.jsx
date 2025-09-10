// src/pages/review.js
import React, { useState } from "react";

export default function ReviewPage() {
  const [overallRating, setOverallRating] = useState(0);
  const [stylistRating, setStylistRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const StarRating = ({ rating, setRating, disabled }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex flex-wrap gap-2 p-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 transition-transform duration-150 ${
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
            }`}
            onClick={() => !disabled && setRating(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            disabled={disabled}
          >
            <svg
              className={`w-10 h-10 ${
                rating >= star || hoverRating >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1 items-center justify-center text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0d141c] mb-4">
            Thank You for Your Review!
          </h2>
          <p className="text-[#49739c] mb-8">
            Your feedback has been successfully submitted.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
          >
            Submit Another Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">
              Leave a Review
            </p>
            <p className="text-[#49739c] text-sm font-normal leading-normal">
              Share your experience with others
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Overall Experience
          </h3>
          <StarRating
            rating={overallRating}
            setRating={setOverallRating}
            name="overall-rating"
            disabled={isSubmitting}
          />

          <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Stylist Rating
          </h3>
          <StarRating
            rating={stylistRating}
            setRating={setStylistRating}
            name="stylist-rating"
            disabled={isSubmitting}
          />

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Write your review here (max 500 characters)"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] min-h-36 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-right text-xs text-[#49739c] mt-1">
                {reviewText.length}/500 characters
              </div>
            </label>
          </div>

          <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Add Photos (Optional)
          </h3>
          <div className="flex flex-col p-4">
            <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-[#cedbe8] px-6 py-14">
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <p className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                  Upload Photos
                </p>
                <p className="text-[#0d141c] text-sm font-normal leading-normal max-w-[480px] text-center">
                  Drag and drop or click to upload
                </p>
              </div>
              <button
                type="button"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="truncate">Choose Files</span>
              </button>
            </div>
          </div>

          <div className="flex px-4 py-3 justify-end">
            <button
              type="submit"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-70 disabled:cursor-not-allowed relative"
              disabled={isSubmitting || !overallRating || !stylistRating}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <span className="truncate">Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
