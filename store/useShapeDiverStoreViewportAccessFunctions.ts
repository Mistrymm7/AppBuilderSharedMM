import { create } from "zustand";
import { IShapeDiverStoreViewportAccessFunctionsStore } from "shared/types/store/shapediverStoreViewportAccessFunctions";
import { devtools } from "zustand/middleware";
import { devtoolsSettings } from "./storeSettings";


/**
 * Store for ShapeDiver viewport access functions.
 * @see {@link IShapeDiverStoreViewportAccessFunctions}
 */
export const useShapeDiverStoreViewportAccessFunctions = create<IShapeDiverStoreViewportAccessFunctionsStore>()(devtools((set, get) => ({
    
	viewportAccessFunctions: {},
    
	addViewportAccessFunctions: (viewportId, accessFunctions) => {
		set(state => ({
			viewportAccessFunctions: {
				...state.viewportAccessFunctions,
				[viewportId]: accessFunctions
			}
		}), false, `addViewportAccessFunctions ${viewportId}`);
	},
    
	removeViewportAccessFunctions: (viewportId) => {
		const { viewportAccessFunctions } = get();

		if (!viewportAccessFunctions[viewportId]) return;

		set(state => {
			const newState = { ...state.viewportAccessFunctions };
			delete newState[viewportId];
			
			return { viewportAccessFunctions: newState };
		}, false, `removeViewportAccessFunctions ${viewportId}`);
	}

}), { ...devtoolsSettings, name: "ShapeDiver | Viewer" }));