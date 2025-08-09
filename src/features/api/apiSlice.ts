import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import type { RootState } from '@/app/store';
import { setCredentials, logout } from '@/features/auth/authSlice';
import type {
  Recipe,
  Panel,
  Plateup,
  PlateupFolder,
  Ingredient,
  User,
  UserPermissions,
  Notification,
  PendingRequest,
} from '@/lib/types';

const transformPanel = (panel: Record<string, unknown>): Panel => ({
  id: String(panel._id ?? panel.id),
  name: String(panel.name),
  order: Number(panel.order),
  recipeCount: Number(panel.recipeCount),
  image:
    panel.image &&
      typeof panel.image === 'object' &&
      'url' in panel.image &&
      'publicId' in panel.image
      ? {
        url: String((panel.image as Record<string, unknown>).url),
        publicId: String((panel.image as Record<string, unknown>).publicId),
      }
      : null,
  isActive: panel.isActive as boolean | undefined,
  createdBy: panel.createdBy as string | undefined,
  updatedBy: panel.updatedBy as string | undefined,
});

const transformIngredient = (
  ingredient: Record<string, unknown>
): Ingredient => ({
  name: String(ingredient.name),
  quantity:
    'quantity' in ingredient && ingredient.quantity !== undefined
      ? String(ingredient.quantity)
      : undefined,
  unit:
    'unit' in ingredient && ingredient.unit !== undefined
      ? String(ingredient.unit)
      : undefined,
  notes:
    'notes' in ingredient && ingredient.notes !== undefined
      ? String(ingredient.notes)
      : undefined,
});

const transformRecipe = (recipe: Record<string, unknown>): Recipe => ({
  id: String(recipe._id ?? recipe.id),
  title: String(recipe.title),
  panel:
    typeof recipe.panel === 'string'
      ? recipe.panel
      : String(
        (recipe.panel as Record<string, unknown> | undefined)?._id ??
        (recipe.panel as Record<string, unknown> | undefined)?.id ??
        ''
      ),
  image:
    recipe.image && typeof recipe.image === 'object' && 'url' in recipe.image
      ? {
        url: String((recipe.image as Record<string, unknown>).url),
        publicId: String((recipe.image as Record<string, unknown>).publicId),
      }
      : null,
  ingredients: Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as Record<string, unknown>[]).map(
      transformIngredient
    )
    : [],
  method: String(recipe.method),
  chefNotes:
    'chefNotes' in recipe && recipe.chefNotes !== undefined
      ? String(recipe.chefNotes)
      : undefined,
  prepTime:
    'prepTime' in recipe && recipe.prepTime !== undefined
      ? Number(recipe.prepTime)
      : undefined,
  cookTime:
    'cookTime' in recipe && recipe.cookTime !== undefined
      ? Number(recipe.cookTime)
      : undefined,
  servings:
    'servings' in recipe && recipe.servings !== undefined
      ? Number(recipe.servings)
      : undefined,
  difficulty: recipe.difficulty as Recipe['difficulty'] | undefined,
  tags: Array.isArray(recipe.tags)
    ? (recipe.tags as unknown[]).map((t) => String(t))
    : [],
  isActive: recipe.isActive as boolean | undefined,
  createdBy: recipe.createdBy as string | undefined,
  updatedBy: recipe.updatedBy as string | undefined,
  version:
    'version' in recipe && recipe.version !== undefined
      ? Number(recipe.version)
      : undefined,
});

const transformPlateup = (plateup: Record<string, unknown>): Plateup => ({
  id: String(plateup._id ?? plateup.id),
  name: String(plateup.name),
  image:
    plateup.image &&
    typeof plateup.image === 'object' &&
    'url' in plateup.image &&
    'publicId' in plateup.image
      ? {
          url: String((plateup.image as Record<string, unknown>).url),
          publicId: String((plateup.image as Record<string, unknown>).publicId),
        }
      : null,
  createdBy: plateup.createdBy as string | undefined,
  updatedBy: plateup.updatedBy as string | undefined,
});

const transformPlateupFolder = (
  folder: Record<string, unknown>
): PlateupFolder => ({
  id: String(folder._id ?? folder.id),
  name: String(folder.name),
  createdBy: folder.createdBy as string | undefined,
  updatedBy: folder.updatedBy as string | undefined,
});

const transformNotification = (
  notif: Record<string, unknown>
): Notification => ({
  id: String(notif._id ?? notif.id),
  title: String(notif.title),
  message: String(notif.message),
  type: String(notif.type ?? 'info'),
  createdAt: String(notif.createdAt ?? ''),
  read:
    'read' in notif
      ? Boolean((notif as Record<string, unknown>).read)
      : false,
});

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (
        refreshResult.data &&
        (refreshResult.data as { accessToken?: string }).accessToken
      ) {
        const user = (api.getState() as RootState).auth.user;
        api.dispatch(
          setCredentials({
            user,
            accessToken: (refreshResult.data as { accessToken: string })
              .accessToken,
            refreshToken,
          })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Panel', 'Recipe', 'User', 'Chef', 'Auth', 'Notification', 'Plateup', 'PlateupFolder', 'Restaurant'],
  endpoints: (builder) => ({
    getRecipes: builder.query<Recipe[], { panelId?: string } | void>({
      query: (arg) => {
        const params: Record<string, string> = {};
        
        if (arg && typeof arg === 'object' && arg.panelId) {
          params.panel = arg.panelId;
        }
        
        // Add organization context if available (from restaurant QR flow)
        const restaurantContext = typeof window !== 'undefined' 
          ? localStorage.getItem('restaurantContext') 
          : null;
        if (restaurantContext) {
          params.organization = restaurantContext;
        }
        
        return { url: '/recipes', params: Object.keys(params).length > 0 ? params : undefined };
      },
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const recipes = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (recipes as Record<string, unknown>[]).map(transformRecipe);
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Recipe' as const, id })),
            { type: 'Recipe', id: 'LIST' },
          ]
          : [{ type: 'Recipe', id: 'LIST' }],
    }),

    getRecipe: builder.query<Recipe, string>({
      query: (id) => `/recipes/${id}`,
      transformResponse: (response: { data?: unknown } | unknown) =>
        transformRecipe(
          (Array.isArray(response)
            ? response[0]
            : (response as { data?: unknown }).data) as Record<string, unknown>
        ),
      providesTags: (_result, _error, id) => [{ type: 'Recipe', id }],
    }),

    createRecipe: builder.mutation<Recipe, FormData>({
      query: (data) => ({
        url: '/recipes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),

    updateRecipe: builder.mutation<Recipe, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/recipes/${id}`,
        method: 'PUT',
        body: { title },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Recipe', id },
        { type: 'Recipe', id: 'LIST' },
      ],
    }),

    deleteRecipe: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),

    uploadIngredientImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/recipes/ai-scan',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Recipe', id: 'LIST' }],
    }),

    login: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    loginChef: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      { headChefId: string; chefId: string }
    >({
      query: ({ headChefId, chefId }) => ({
        url: `/auth/login/${headChefId}/${chefId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    qrAuth: builder.mutation<
      { user: User; accessToken: string; refreshToken: string; restaurant: any },
      { orgId: string }
    >({
      query: ({ orgId }) => ({
        url: `/auth/qr/${orgId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    register: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      { email: string; password: string; name: string; role?: string }
    >({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    refreshToken: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'SESSION' }],
    }),

    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    requestChefAccess: builder.mutation<
      { id: string; status: string; userId: string },
      { headChefId: string; firstName: string; lastName: string }
    >({
      query: (body) => ({
        url: '/chefs/request-access',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Chef', id: 'REQUESTS' }],
    }),

    getChefRequest: builder.query<
      { data: { id: string; status: string; name: string } },
      string
    >({
      query: (id) => `/chefs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Chef', id }],
    }),

    getPanels: builder.query<Panel[], void>({
      query: () => '/panels',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const panels = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (panels as Record<string, unknown>[]).map(transformPanel);
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Panel' as const, id })),
            { type: 'Panel', id: 'LIST' },
          ]
          : [{ type: 'Panel', id: 'LIST' }],
    }),

    getPanel: builder.query<Panel, string>({
      query: (id) => `/panels/${id}`,
      transformResponse: (response: { data?: unknown } | unknown) =>
        transformPanel(
          (Array.isArray(response)
            ? response[0]
            : (response as { data?: unknown }).data) as Record<string, unknown>
        ),
      providesTags: (_result, _error, id) => [{ type: 'Panel', id }],
    }),

    createPanel: builder.mutation<Panel, FormData>({
      query: (data) => ({
        url: '/panels',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Panel', id: 'LIST' }],
    }),

    updatePanel: builder.mutation<Panel, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/panels/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Panel', id }],
    }),

    deletePanel: builder.mutation<void, string>({
      query: (id) => ({
        url: `/panels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Panel', id }],
    }),

    reorderPanels: builder.mutation<
      void,
      { panels: { id: string; order: number }[] }
    >({
      query: (body) => ({
        url: '/panels/reorder',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Panel', id: 'LIST' }],
    }),

    getPlateups: builder.query<Plateup[], void>({
      query: () => '/plateups',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const plateups = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (plateups as Record<string, unknown>[]).map(transformPlateup);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Plateup' as const, id })),
              { type: 'Plateup', id: 'LIST' },
            ]
          : [{ type: 'Plateup', id: 'LIST' }],
    }),

    createPlateup: builder.mutation<Plateup, FormData>({
      query: (data) => ({
        url: '/plateups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Plateup', id: 'LIST' }],
    }),

    createPlateupInFolder: builder.mutation<Plateup, { data: FormData; folderId: string }>({
      query: ({ data, folderId }) => {
        data.append('folder', folderId);
        return {
          url: '/plateups',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: (_result, _error, { folderId }) => [
        { type: 'Plateup', id: 'LIST' },
        { type: 'PlateupFolder', id: folderId },
      ],
    }),

    deletePlateup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/plateups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Plateup', id },
        { type: 'Plateup', id: 'LIST' },
      ],
    }),

    updatePlateup: builder.mutation<Plateup, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/plateups/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      transformResponse: (plateup: Record<string, unknown>) =>
        transformPlateup(plateup),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Plateup', id },
        { type: 'Plateup', id: 'LIST' },
      ],
    }),

    getPlateupFolders: builder.query<PlateupFolder[], void>({
      query: () => '/plateup-folders',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const folders = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (folders as Record<string, unknown>[]).map(
          transformPlateupFolder
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PlateupFolder' as const, id })),
              { type: 'PlateupFolder', id: 'LIST' },
            ]
          : [{ type: 'PlateupFolder', id: 'LIST' }],
    }),

    createPlateupFolder: builder.mutation<PlateupFolder, { name: string }>({
      query: (data) => ({
        url: '/plateup-folders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'PlateupFolder', id: 'LIST' }],
    }),

    updatePlateupFolder: builder.mutation<
      PlateupFolder,
      { id: string; data: { name: string } }
    >({
      query: ({ id, data }) => ({
        url: `/plateup-folders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'PlateupFolder', id }],
    }),

    deletePlateupFolder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/plateup-folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'PlateupFolder', id },
        { type: 'PlateupFolder', id: 'LIST' },
      ],
    }),

    getPlateupsByFolder: builder.query<Plateup[], string>({
      query: (folderId) => `/plateups?folder=${folderId}`,
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const plateups = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (plateups as Record<string, unknown>[]).map(transformPlateup);
      },
      providesTags: (_r, _e, id) => [
        { type: 'PlateupFolder', id },
        { type: 'Plateup', id: 'LIST' },
      ],
    }),

    getTeamMembers: builder.query<User[], void>({
      query: () => '/users/team',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const users = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (users as Record<string, unknown>[]).map((user) => ({
          id: String(user._id ?? user.id),
          name: String(user.name),
          email: String(user.email),
          role: String(user.role),
          status: String(user.status),
          organization: (user as Record<string, unknown>).organization
            ? String((user as Record<string, unknown>).organization)
            : '',
          permissions:
            ((user as Record<string, unknown>).permissions as UserPermissions) || {
              canViewRecipes: false,
              canEditRecipes: false,
              canDeleteRecipes: false,
              canUpdateRecipes: false,

              canViewPlateups: false,
              canCreatePlateups: false,
              canDeletePlateups: false,
              canUpdatePlateups: false,

              canViewNotifications: false,
              canCreateNotifications: false,
              canDeleteNotifications: false,
              canUpdateNotifications: false,

              canViewPanels: false,
              canCreatePanels: false,
              canDeletePanels: false,
              canUpdatePanels: false,

              canManageTeam: false,
              canAccessAdmin: false,
            },
          createdAt: new Date(user.createdAt as string),
          updatedAt: new Date(user.updatedAt as string),
        }));
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'User' as const, id })),
            { type: 'User', id: 'LIST' },
          ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    updateTeamMember: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/team/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),

    deleteTeamMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/team/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const notifs = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (notifs as Record<string, unknown>[]).map(transformNotification);
      },
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: { count?: number } | unknown) =>
        Number(
          (Array.isArray(response)
            ? response[0]
            : (response as { count?: number }).count) ?? 0
        ),
      providesTags: [{ type: 'Notification', id: 'UNREAD' }],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    sendNotification: builder.mutation<
      Notification,
      { title: string; message: string; recipients: string[]; type?: string }
    >({
      query: (data) => ({
        url: '/notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
      ],
    }),

    getMyRestaurant: builder.query<{ name: string; organizationId: string; type: string; status: string }, void>({
      query: () => '/restaurant/head-chef/my-restaurant',
      transformResponse: (response: { data?: unknown } | unknown) => {
        const restaurant = Array.isArray(response)
          ? response[0]
          : (response as { data?: unknown }).data;
        return {
          name: String(restaurant?.name || ''),
          organizationId: String(restaurant?.organizationId || ''),
          type: String(restaurant?.type || ''),
          status: String(restaurant?.status || ''),
        };
      },
      providesTags: [{ type: 'Restaurant' as const, id: 'MY_RESTAURANT' }],
    }),

    getPendingRequests: builder.query<PendingRequest[], void>({
      query: () => '/users/pending-chefs',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const requests = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (requests as Record<string, unknown>[]).map((request) => ({
          id: String(request._id ?? request.id),
          name: String(request.name),
          status: String(request.status),
        }));
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'User' as const, id })),
            { type: 'User', id: 'PENDING_LIST' },
          ]
          : [{ type: 'User', id: 'PENDING_LIST' }],
    }),

    updatePendingRequest: builder.mutation<void, { id: string; status: 'active' | 'rejected' }>({
      query: ({ id, status }) => ({
        url: `/users/pending-chefs/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'PENDING_LIST' },
        { type: 'User', id: 'LIST' },
      ],
    }),

    getSavedRecipes: builder.query<Recipe[], void>({
      query: () => '/users/saved-recipes',
      transformResponse: (response: { data?: unknown[] } | unknown[]) => {
        const recipes = Array.isArray(response)
          ? response
          : (response as { data?: unknown[] }).data ?? [];
        return (recipes as Record<string, unknown>[]).map(transformRecipe);
      },
      providesTags: [{ type: 'Recipe', id: 'SAVED' }],
    }),

    saveRecipe: builder.mutation<void, string>({
      query: (recipeId) => ({
        url: `/users/saved-recipes/${recipeId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'SAVED' }],
    }),

    unsaveRecipe: builder.mutation<void, string>({
      query: (recipeId) => ({
        url: `/users/saved-recipes/${recipeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Recipe', id: 'SAVED' }],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useUploadIngredientImageMutation,
  useLoginMutation,
  useLoginChefMutation,
  useQrAuthMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetPanelsQuery,
  useGetPanelQuery,
  useCreatePanelMutation,
  useUpdatePanelMutation,
  useDeletePanelMutation,
  useReorderPanelsMutation,
  useGetPlateupsQuery,
  useCreatePlateupMutation,
  useCreatePlateupInFolderMutation,
  useDeletePlateupMutation,
  useUpdatePlateupMutation,
  useGetPlateupFoldersQuery,
  useCreatePlateupFolderMutation,
  useUpdatePlateupFolderMutation,
  useDeletePlateupFolderMutation,
  useGetPlateupsByFolderQuery,
  useRequestChefAccessMutation,
  useGetChefRequestQuery,
  useGetTeamMembersQuery,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSendNotificationMutation,
  useDeleteNotificationMutation,
  useGetPendingRequestsQuery,
  useUpdatePendingRequestMutation,
  useGetSavedRecipesQuery,
  useSaveRecipeMutation,
  useUnsaveRecipeMutation,
  useGetMyRestaurantQuery,
} = apiSlice;
