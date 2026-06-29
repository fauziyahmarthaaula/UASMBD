import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// =======================
// FIREBASE CONFIG
// =======================

const firebaseConfig = {
    apiKey: "AIzaSyBJgzx2t4kSdqcrId0MB1YYx9YjEi7iL_U",
    authDomain: "koskita-app-f69ad.firebaseapp.com",
    projectId: "koskita-app-f69ad",
    storageBucket: "koskita-app-f69ad.firebasestorage.app",
    messagingSenderId: "502984689733",
    appId: "1:502984689733:web:74f6db34e626cd989efb2c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =======================
// ELEMENT HTML
// =======================

const propertyContainer = document.getElementById("propertyContainer");
const paymentBody = document.getElementById("paymentBody");

const totalProperty = document.getElementById("totalProperty");
const totalRoom = document.getElementById("totalRoom");
const occupiedRoom = document.getElementById("occupiedRoom");
const totalUnpaid = document.getElementById("totalUnpaid");

// =======================
// STATISTIK
// =======================

let jumlahProperty = 0;
let jumlahRoom = 0;
let jumlahOccupied = 0;

// =======================
// PROPERTIES
// =======================

onSnapshot(collection(db, "properties"), (propertySnapshot) => {

    propertyContainer.innerHTML = "";

    jumlahProperty = propertySnapshot.size;
    jumlahRoom = 0;
    jumlahOccupied = 0;

    totalProperty.textContent = jumlahProperty;

    propertySnapshot.forEach((propertyDoc) => {

        const property = propertyDoc.data();

        const fasilitas = property.facilities
            ? property.facilities.join(", ")
            : "-";

        const card = document.createElement("div");

        card.className = "property-card";

        card.innerHTML = `
            <div class="property-title">
                <h3>${property.name}</h3>
                <p>${property.address}</p>
                <div class="facility">
                    <strong>Fasilitas :</strong> ${fasilitas}
                </div>
            </div>

            <table>

                <thead>

                    <tr>
                        <th>No Kamar</th>
                        <th>Tipe</th>
                        <th>Harga</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody id="room-${propertyDoc.id}">
                    <tr>
                        <td colspan="4">Loading...</td>
                    </tr>
                </tbody>

            </table>
        `;

        propertyContainer.appendChild(card);

        // =======================
        // SUB COLLECTION ROOMS
        // =======================

        onSnapshot(
            collection(db, "properties", propertyDoc.id, "rooms"),
            (roomSnapshot) => {

                jumlahRoom += roomSnapshot.size;

                totalRoom.textContent = jumlahRoom;

                let html = "";

                roomSnapshot.forEach((roomDoc) => {

                    const room = roomDoc.data();

                    let badge = "";

                    if (room.status === "available") {

                        badge = `<span class="badge available">Available</span>`;

                    } else if (room.status === "occupied") {

                        badge = `<span class="badge occupied">Occupied</span>`;

                        jumlahOccupied++;

                    } else {

                        badge = `<span class="badge maintenance">Maintenance</span>`;

                    }

                    html += `
                        <tr>

                            <td>${room.roomNumber}</td>

                            <td>${room.type}</td>

                            <td>
                                Rp ${Number(room.price).toLocaleString("id-ID")}
                            </td>

                            <td>${badge}</td>

                        </tr>
                    `;

                });

                occupiedRoom.textContent = jumlahOccupied;

                document.getElementById(
                    "room-" + propertyDoc.id
                ).innerHTML = html;

            }
        );

    });

});

// =======================
// TAGIHAN UNPAID
// =======================

const unpaidQuery = query(

    collection(db, "payments"),

    where("status", "==", "unpaid")

);

onSnapshot(unpaidQuery, (paymentSnapshot) => {

    paymentBody.innerHTML = "";

    totalUnpaid.textContent = paymentSnapshot.size;

    paymentSnapshot.forEach((paymentDoc) => {

        const payment = paymentDoc.data();

        paymentBody.innerHTML += `

        <tr>

            <td>${payment.tenantId}</td>

            <td>${payment.propertyId}</td>

            <td>${payment.month}</td>

            <td>
                Rp ${Number(payment.amount).toLocaleString("id-ID")}
            </td>

            <td>
                <span class="badge unpaid">
                    UNPAID
                </span>
            </td>

        </tr>

        `;

    });

});