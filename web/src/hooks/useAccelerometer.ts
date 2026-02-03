"use client";

import { useCallback, useEffect, useState } from "react";

interface DeviceMotionEventPermission {
	requestPermission?: () => Promise<"granted" | "denied">;
}

export interface AccelerometerData {
	x: number;
	y: number;
	z: number;
	timestamp: number;
}

export const useAccelerometer = () => {
	const [data, setData] = useState<AccelerometerData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSupported, setIsSupported] = useState<boolean>(true);
	const [isPermissionGranted, setIsPermissionGranted] = useState<
		boolean | null
	>(null);

	useEffect(() => {
		if (typeof window !== "undefined" && !window.DeviceMotionEvent) {
			requestAnimationFrame(() => setIsSupported(false));
		}
	}, []);

	const requestPermission = useCallback(async () => {
		// iOS 13+ requires explicit permission
		const deviceMotionEvent = (typeof DeviceMotionEvent !== "undefined"
			? DeviceMotionEvent
			: undefined) as unknown as DeviceMotionEventPermission;
		if (
			typeof window !== "undefined" &&
			typeof deviceMotionEvent.requestPermission === "function"
		) {
			try {
				const response = await deviceMotionEvent.requestPermission();
				if (response === "granted") {
					setIsPermissionGranted(true);
					return true;
				} else {
					setIsPermissionGranted(false);
					setError("Permission denied");
					return false;
				}
			} catch {
				setError("Error requesting permission");
				return false;
			}
		} else {
			// For non-iOS or older iOS, permission is usually granted by default
			setIsPermissionGranted(true);
			return true;
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !window.DeviceMotionEvent) {
			return;
		}

		const handleMotionEvent = (event: DeviceMotionEvent) => {
			const accel = event.accelerationIncludingGravity;
			if (accel) {
				setData({
					x: accel.x || 0,
					y: accel.y || 0,
					z: accel.z || 0,
					timestamp: Date.now(),
				});
			}
		};

		if (isPermissionGranted) {
			window.addEventListener("devicemotion", handleMotionEvent);
		}

		return () => {
			window.removeEventListener("devicemotion", handleMotionEvent);
		};
	}, [isPermissionGranted]);

	return { data, error, isSupported, isPermissionGranted, requestPermission };
};
