from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import pandas as pd


y_true = [

    # PLUMBER
    "Pipe Fitting",
    "Plumbing",
    "Wrench Usage",
    "Leak Fixing",
    "Sink Repair",
    "Toilet Repair",
    "Drain Cleaning",

    # ELECTRICIAN
    "Wiring",
    "Cable Management",
    "Switch Installation",
    "Circuit Repair",
    "Socket Installation",
    "Fuse Replacement",
    "Panel Work",

    # COOK
    "Cooking",
    "Kitchen Work",
    "Frying",
    "Boiling",
    "Baking",
    "Chopping",
    "Dish Preparation",

    # CLEANER
    "Cleaning",
    "Mopping",
    "Sweeping",
    "Vacuuming",
    "Dusting",
    "Scrubbing",
    "Sanitization",

    # STEAM IRONING
    "Ironing",
    "Steam Ironing",
    "Clothes Pressing",
    "Laundry",
    "Shirt Pressing",
    "Fabric Care",
    "Wrinkle Removal"
]
#Model Predictions
y_pred = [

    # PLUMBER
    "Pipe Fitting",
    "Plumbing",
    "Wrench Usage",
    "Drain Cleaning",      # Wrong
    "Sink Repair",
    "Toilet Repair",
    "Drain Cleaning",

    # ELECTRICIAN
    "Wiring",
    "Cable Management",
    "Switch Installation",
    "Circuit Repair",
    "Socket Installation",
    "Fuse Replacement",
    "Panel Work",

    # COOK
    "Cooking",
    "Kitchen Work",
    "Frying",
    "Boiling",
    "Baking",
    "Cooking",             # Wrong
    "Dish Preparation",

    # CLEANER
    "Cleaning",
    "Mopping",
    "Sweeping",
    "Vacuuming",
    "Dusting",
    "Scrubbing",
    "Cleaning",            # Wrong

    # STEAM IRONING
    "Ironing",
    "Steam Ironing",
    "Clothes Pressing",
    "Laundry",
    "Shirt Pressing",
    "Fabric Care",
    "Steam Ironing"        # Wrong
]

#metrics calculation

precision = precision_score(y_true, y_pred, average='micro')
recall = recall_score(y_true, y_pred, average='micro')
f1 = f1_score(y_true, y_pred, average='micro')

print("\n===== PERFORMANCE METRICS =====")
print(f"Precision : {precision:.2f}")
print(f"Recall    : {recall:.2f}")
print(f"F1 Score  : {f1:.2f}")

# metrics visualization

metrics = ['Precision', 'Recall', 'F1 Score']
scores = [precision, recall, f1]

plt.figure(figsize=(7,5))
plt.bar(metrics, scores)
plt.ylim(0, 1)
plt.title("Skill Extraction Performance")
plt.ylabel("Score")
plt.show()

#Confusion matrix

labels = sorted(list(set(y_true + y_pred)))

cm = confusion_matrix(y_true, y_pred, labels=labels)

cm_df = pd.DataFrame(cm, index=labels, columns=labels)

print("\n===== CONFUSION MATRIX =====")
print(cm_df)



plt.figure(figsize=(14,10))
plt.imshow(cm, interpolation='nearest')

plt.title("Confusion Matrix")
plt.colorbar()

tick_marks = range(len(labels))

plt.xticks(tick_marks, labels, rotation=90)
plt.yticks(tick_marks, labels)

plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.tight_layout()
plt.show()