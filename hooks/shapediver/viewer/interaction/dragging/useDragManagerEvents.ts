import { addListener, DraggingParameterValue, EVENTTYPE_INTERACTION, IEvent, removeListener } from "@shapediver/viewer";
import { DragManager, InteractionEventResponseMapping, matchNodesWithPatterns, RestrictionProperties } from "@shapediver/viewer.features.interaction";
import { useState, useEffect, useRef } from "react";
import { ConvertedDragObject } from "../useCreateNameFilterPattern";

// #region Functions (1)

/**
 * Hook allowing to create the drag manager events.
 * 
 * @param pattern The pattern to match the dragged nodes.
 * @param componentId The ID of the component.
 */
export function useDragManagerEvents(
	convertedDragObjects: ConvertedDragObject[],
	componentId: string,
	initialDraggedNodes?: DraggingParameterValue["objects"]
): {
	/**
	 * The dragged node names.
	 */
	draggedNodes: DraggingParameterValue["objects"],
	setDraggedNodes: (nodes: DraggingParameterValue["objects"]) => void,
	resetDraggedNodes: () => void
} {
	// state for the dragged nodes
	const [draggedNodes, setDraggedNodes] = useState<DraggingParameterValue["objects"]>(initialDraggedNodes || []);
	const draggedNodesRef = useRef(draggedNodes);

	useEffect(() => {
		draggedNodesRef.current = draggedNodes;
	}, [draggedNodes]);

	// register an event handler and listen for output updates
	useEffect(() => {
		/**
		 * Event handler for the drag on event.
		 * In this event handler, the dragged node names are updated.
		 */
		const tokenDragOn = addListener(EVENTTYPE_INTERACTION.DRAG_START, async (event: IEvent) => {
			const dragEvent = event as InteractionEventResponseMapping[EVENTTYPE_INTERACTION.DRAG_START];

			// We ignore the event if it's not based on an event triggered by the UI.
			if (!dragEvent.event) return;
			// We ignore the event if it's not based on the component ID.
			if (dragEvent.manager.id !== componentId) return;

			const dragged = [dragEvent.node];

			for (let i = 0; i < convertedDragObjects.length; i++) {
				for (const sessionId in convertedDragObjects[i].patterns) {
					const patterns = convertedDragObjects[i].patterns[sessionId];

					// check if there are any patterns that match the dragged nodes
					const draggedNodeNames = matchNodesWithPatterns(patterns, dragged);
					// if there are, add the restrictions to the drag manager
					if (draggedNodeNames.length > 0) {
						// add the restrictions
						convertedDragObjects[i].restrictions.forEach(restriction => {
							(dragEvent.manager as DragManager).addRestriction(restriction as RestrictionProperties);
						});
					}
				}
			}

			// move the object manually once in the beginning
			// this is necessary as the restrictions were not applied yet
			(dragEvent.manager as DragManager).onMove(
				dragEvent.event as PointerEvent,
				dragEvent.ray!,
				[]
			);
		});

		/**
		 * Event handler for the drag off event.
		 * In this event handler, the dragged node names are updated.
		 */
		const tokenDragOff = addListener(EVENTTYPE_INTERACTION.DRAG_END, async (event: IEvent) => {
			const dragEvent = event as InteractionEventResponseMapping[EVENTTYPE_INTERACTION.DRAG_END];

			// We ignore the event if it's not based on an event triggered by the UI.
			if (!dragEvent.event) return;
			// We ignore the event if it's not based on the component ID.
			if (dragEvent.manager.id !== componentId) return;

			const dragged = [dragEvent.node];

			const newDraggedNodes: DraggingParameterValue["objects"] = [...draggedNodesRef.current];

			for (let i = 0; i < convertedDragObjects.length; i++) {
				for (const sessionId in convertedDragObjects[i].patterns) {
					const patterns = convertedDragObjects[i].patterns[sessionId];
					const draggedNodeNames = matchNodesWithPatterns(patterns, dragged);
					if (draggedNodeNames.length > 0) {
						draggedNodeNames.forEach(draggedNodeName => {
							const index = newDraggedNodes.findIndex(n => n.name === draggedNodeName);

							// create the object from the event data
							const object = {
								name: draggedNodeName,
								transformation: Array.from(dragEvent.matrix),
								dragAnchorId: dragEvent.dragAnchor ? dragEvent.dragAnchor.id : undefined,
								restrictionId: dragEvent.restriction!.id
							};

							if (index > -1) {
								newDraggedNodes[index] = object;
							} else {
								newDraggedNodes.push(object);
							}
						});
					}
				}
			}

			setDraggedNodes(newDraggedNodes);

			// reset the restrictions
			(dragEvent.manager as DragManager).removeRestrictions();
		});

		/**
		 * Remove the event listeners when the component is unmounted.
		 */
		return () => {
			removeListener(tokenDragOn);
			removeListener(tokenDragOff);
		};
	}, [convertedDragObjects, componentId]);

	return {
		draggedNodes,
		setDraggedNodes,
		resetDraggedNodes: () => setDraggedNodes([])
	};
}

// #endregion Functions (1)
