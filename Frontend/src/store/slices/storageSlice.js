import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { storageAPI } from '../../services/api'

// Async thunks
export const fetchBuckets = createAsyncThunk(
  'storage/fetchBuckets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storageAPI.getBuckets()
      return response.data.buckets
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch buckets')
    }
  }
)

export const createBucket = createAsyncThunk(
  'storage/createBucket',
  async (bucketData, { rejectWithValue }) => {
    try {
      const response = await storageAPI.createBucket(bucketData)
      return response.data.bucket
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create bucket')
    }
  }
)

export const updateBucket = createAsyncThunk(
  'storage/updateBucket',
  async ({ bucketId, data }, { rejectWithValue }) => {
    try {
      const response = await storageAPI.updateBucket(bucketId, data)
      return response.data.bucket
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update bucket')
    }
  }
)

export const deleteBucket = createAsyncThunk(
  'storage/deleteBucket',
  async (bucketId, { rejectWithValue }) => {
    try {
      await storageAPI.deleteBucket(bucketId)
      return bucketId
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete bucket')
    }
  }
)

const initialState = {
  buckets: [],
  selectedBucket: null,
  isLoading: false,
  error: null,
}

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    setSelectedBucket: (state, action) => {
      state.selectedBucket = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Buckets
      .addCase(fetchBuckets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBuckets.fulfilled, (state, action) => {
        state.isLoading = false
        state.buckets = action.payload
      })
      .addCase(fetchBuckets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Bucket
      .addCase(createBucket.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBucket.fulfilled, (state, action) => {
        state.isLoading = false
        state.buckets.push(action.payload)
      })
      .addCase(createBucket.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update Bucket
      .addCase(updateBucket.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBucket.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.buckets.findIndex(
          (b) => b.id === action.payload.id
        )
        if (index !== -1) {
          state.buckets[index] = action.payload
        }
        if (state.selectedBucket?.id === action.payload.id) {
          state.selectedBucket = action.payload
        }
      })
      .addCase(updateBucket.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete Bucket
      .addCase(deleteBucket.fulfilled, (state, action) => {
        state.buckets = state.buckets.filter(
          (bucket) => bucket.id !== action.payload
        )
        if (state.selectedBucket?.id === action.payload) {
          state.selectedBucket = null
        }
      })
  },
})

export const { setSelectedBucket, clearError } = storageSlice.actions
export default storageSlice.reducer

