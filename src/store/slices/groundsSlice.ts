import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Ground {
  id: string;
  name: string;
  city: string;
  ground_type: string;
  price?: number;
  avg_rating?: number;
  // add other necessary fields
}

interface GroundsState {
  groundsList: Ground[];
  favoriteIds: string[];
  isLoading: boolean;
}

const initialState: GroundsState = {
  groundsList: [],
  favoriteIds: [],
  isLoading: false,
};

const groundsSlice = createSlice({
  name: 'grounds',
  initialState,
  reducers: {
    setGroundsList: (state, action: PayloadAction<Ground[]>) => {
      state.groundsList = action.payload;
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favoriteIds = action.payload;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favoriteIds.includes(action.payload)) {
        state.favoriteIds.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favoriteIds = state.favoriteIds.filter(id => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setGroundsList, setFavorites, addFavorite, removeFavorite, setLoading } = groundsSlice.actions;
export default groundsSlice.reducer;
