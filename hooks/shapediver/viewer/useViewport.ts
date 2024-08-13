import { useEffect, useRef, useState } from "react";
import { useShapeDiverStoreViewer } from "../../../store/useShapeDiverStoreViewer";
import { ViewportCreateDto } from "../../../types/store/shapediverStoreViewer";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook for creating a viewport of the ShapeDiver 3D Viewer.
 * Typically, you want to directly use the {@link ViewportComponent} instead
 * of calling this hook yourself.
 * @see {@link useShapeDiverStoreViewer} to access the API of the viewport.
 * @param props
 * @returns
 */
export function useViewport(props: ViewportCreateDto) {
	const { createViewport, closeViewport } = useShapeDiverStoreViewer(
		useShallow(state => ({ createViewport: state.createViewport, closeViewport: state.closeViewport }))
	);
	const [error, setError] = useState<Error | undefined>(undefined);
	const promiseChain = useRef(Promise.resolve());
	const canvasRef = useRef(null);

	useEffect(() => {
		promiseChain.current = promiseChain.current.then(async () => {
			const viewportApi = await createViewport({
				canvas: canvasRef.current!,
				...props
			}, { onError: setError });
			if (viewportApi && props.showStatistics)
				viewportApi.showStatistics = true;
		});

		return () => {
			promiseChain.current = promiseChain.current.then(() => closeViewport(props.id));
		};
	}, [props.id]);

	return {
		canvasRef,
		error
	};
}
