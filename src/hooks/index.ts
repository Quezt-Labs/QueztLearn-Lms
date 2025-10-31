// Onboarding hooks
export * from "./onboarding";

// API hooks are exported separately to avoid conflicts
export {
  useLogin,
  useLogout,
  useCurrentUser,
  useCreateOrganization as useCreateOrganizationApi,
  useCreateOrganizationConfig,
  useRegister as useRegisterApi,
  useVerifyEmail as useVerifyEmailApi,
  useSetPassword as useSetPasswordApi,
  useResendVerification,
  useAuth,
  useGetAllUsers,
  useDeleteUser,
  useInviteTeacher,
  useInviteAdmin,
  useGetAllBatches,
  useGetBatch,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
  useCreateTeacher,
  useGetAllTeachers,
  useGetTeachersByBatch,
  useUpdateTeacher,
  useDeleteTeacher,
  useAssignTeacherToBatch,
  useRemoveTeacherFromBatch,
  useGenerateSignedUrl,
  useDirectUpload,
  useCreateSubject,
  useGetSubjectsByBatch,
  useGetSubject,
  useUpdateSubject,
  useDeleteSubject,
  useCreateChapter,
  useGetChaptersBySubject,
  useGetChapter,
  useUpdateChapter,
  useDeleteChapter,
  useCreateTopic,
  useGetTopicsByChapter,
  useGetTopic,
  useUpdateTopic,
  useDeleteTopic,
  useCreateContent,
  useGetContentsByTopic,
  useGetContent,
  useUpdateContent,
  useDeleteContent,
  queryKeys,
} from "./api";

// Dashboard hooks
export * from "./dashboard";

// Authentication hooks
export * from "./auth";

// Common hooks
export * from "./common";

// Test Series hooks
export * from "./test-series";
export * from "./test-series-client";
export * from "./test-attempts-client";
