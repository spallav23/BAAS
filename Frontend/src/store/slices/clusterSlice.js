import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { clusterAPI } from '../../services/api'

// Async thunks
export const fetchClusters = createAsyncThunk(
  'clusters/fetchClusters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clusterAPI.getClusters()
      return response.data.clusters
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch clusters')
    }
  }
)

export const createCluster = createAsyncThunk(
  'clusters/createCluster',
  async (clusterData, { rejectWithValue }) => {
    try {
      const response = await clusterAPI.createCluster(clusterData)
      return response.data.cluster
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create cluster')
    }
  }
)

export const deleteCluster = createAsyncThunk(
  'clusters/deleteCluster',
  async (clusterId, { rejectWithValue }) => {
    try {
      await clusterAPI.deleteCluster(clusterId)
      return clusterId
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete cluster')
    }
  }
)

const initialState = {
  clusters: [],
  selectedCluster: null,
  isLoading: false,
  error: null,
}

const clusterSlice = createSlice({
  name: 'clusters',
  initialState,
  reducers: {
    setSelectedCluster: (state, action) => {
      state.selectedCluster = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clusters
      .addCase(fetchClusters.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClusters.fulfilled, (state, action) => {
        state.isLoading = false
        state.clusters = action.payload
      })
      .addCase(fetchClusters.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Cluster
      .addCase(createCluster.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCluster.fulfilled, (state, action) => {
        state.isLoading = false
        state.clusters.push(action.payload)
      })
      .addCase(createCluster.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete Cluster
      .addCase(deleteCluster.fulfilled, (state, action) => {
        state.clusters = state.clusters.filter(
          (cluster) => cluster.id !== action.payload
        )
        if (state.selectedCluster?.id === action.payload) {
          state.selectedCluster = null
        }
      })
  },
})

export const { setSelectedCluster, clearError } = clusterSlice.actions
export default clusterSlice.reducer

