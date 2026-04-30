self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/vercel.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.predictionId || "1",
        url: data.url || "/",
      },
      actions: [
        {
          action: "snoozed",
          title: "Snooze (15m)",
        },
        {
          action: "dismissed",
          title: "Dismiss",
        },
      ],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  
  const action = event.action;
  const predictionId = event.notification.data.primaryKey;

  if (action === "snoozed" || action === "dismissed") {
    // Ping backend to log interaction
    event.waitUntil(
      fetch("/api/tracking/nudge-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          predictionId: predictionId,
          action: action,
        }),
      })
    );
  } else {
    // Normal click on notification body opens the app
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
