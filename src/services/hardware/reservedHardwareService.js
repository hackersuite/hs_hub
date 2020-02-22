"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var entity_1 = require("../../db/entity");
var errorHandling_1 = require("../../util/errorHandling");
var inversify_1 = require("inversify");
var types_1 = require("../../types");
var ReservedHardwareService = /** @class */ (function () {
    function ReservedHardwareService(_reservedHardwareRepository) {
        var _this = this;
        /**
         * Gets all the user reservations, for all hardware items, that have not expired
         *
         * Gets both taken and reserved items
         */
        this.getAll = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllReservationsRemoveExpired()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.getAllReservationsRemoveExpired = function () { return __awaiter(_this, void 0, void 0, function () {
            var allReservations;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllReservations()];
                    case 1:
                        allReservations = _a.sent();
                        return [4 /*yield*/, Promise.all(allReservations.map(function (reservation) { return __awaiter(_this, void 0, void 0, function () {
                                var err_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(reservation.isReserved && !this.isReservationValid(reservation.reservationExpiry))) return [3 /*break*/, 4];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, this.deleteReservation(undefined, reservation)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, Promise.resolve(undefined)];
                                        case 3:
                                            err_1 = _a.sent();
                                            return [2 /*return*/, Promise.reject("Failed to remove expired reservations")];
                                        case 4: return [2 /*return*/, Promise.resolve(reservation)];
                                    }
                                });
                            }); }))];
                    case 2:
                        allReservations = _a.sent();
                        return [2 /*return*/, allReservations.filter(function (reservation) { return reservation !== undefined; })];
                }
            });
        }); };
        this.getAllReservations = function () { return __awaiter(_this, void 0, void 0, function () {
            var reservations, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reservedHardwareRepository
                                .createQueryBuilder("reservation")
                                .addSelect("user.id")
                                .innerJoinAndSelect("reservation.hardwareItem", "item")
                                .innerJoinAndSelect("reservation.user", "user")
                                .getMany()];
                    case 1:
                        reservations = _a.sent();
                        return [2 /*return*/, reservations];
                    case 2:
                        err_2 = _a.sent();
                        throw new Error("Lost connection to database (hub)! " + err_2);
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.getReservation = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var reservation, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reservedHardwareRepository
                                .createQueryBuilder("reservation")
                                .innerJoinAndSelect("reservation.hardwareItem", "item")
                                .innerJoinAndSelect("reservation.user", "user")
                                .where("reservation.reservationToken = :token", { token: token })
                                .getOne()];
                    case 1:
                        reservation = _a.sent();
                        return [2 /*return*/, reservation];
                    case 2:
                        err_3 = _a.sent();
                        throw new Error("Lost connection to database (hub)! " + err_3);
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * `cancelReservation` is safer to use than `deleteReservation`. Cancelling a reservation will do the following:
         *
         *  - It finds the reservation entity from the token
         *
         *  - Checks the reservation exists and tries to cancel the user reservation
         * @param token The token of the reservation
         * @param userId The user id of the user performing the cancellation
         */
        this.cancelReservation = function (token, userId) { return __awaiter(_this, void 0, void 0, function () {
            var reservation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.reservedHardwareRepository
                            .createQueryBuilder("reservation")
                            .innerJoinAndSelect("reservation.hardwareItem", "item")
                            .innerJoinAndSelect("reservation.user", "user")
                            .where("reservation.reservationToken = :token", { token: token })
                            .andWhere("userId = :userId", { userId: userId })
                            .getOne()];
                    case 1:
                        reservation = _a.sent();
                        if (!reservation) {
                            throw new errorHandling_1.ApiError(errorHandling_1.HttpResponseCode.BAD_REQUEST, "Could not find reservation!");
                        }
                        if (!reservation.isReserved) {
                            throw new errorHandling_1.ApiError(errorHandling_1.HttpResponseCode.BAD_REQUEST, "This reservation cannot be cancelled!");
                        }
                        return [4 /*yield*/, this.reservedHardwareRepository.manager.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var response, reservationForToken;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.removeReservation(token, transaction)];
                                        case 1:
                                            response = _a.sent();
                                            if (!(response.raw.affectedRows != 1)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, transaction
                                                    .getRepository(entity_1.ReservedHardwareItem)
                                                    .createQueryBuilder("reservation")
                                                    .where("reservation.reservationToken = :token", { token: token })
                                                    .getOne()];
                                        case 2:
                                            reservationForToken = _a.sent();
                                            if (reservationForToken)
                                                throw new errorHandling_1.ApiError(errorHandling_1.HttpResponseCode.INTERNAL_ERROR, "Could not cancel reservation, please inform us that this error occured.");
                                            _a.label = 3;
                                        case 3: return [4 /*yield*/, transaction
                                                .getRepository(entity_1.HardwareItem)
                                                .decrement({ id: reservation.hardwareItem.id }, "reservedStock", reservation.reservationQuantity)];
                                        case 4:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * Delete reservation is used to remove the reservation entry from the database, and decrement the number of the item reserved
         * @param tokenToDelete The token is used to find the item reservation
         * @param reservation If defined, then the reservation object is used instead of the token
         */
        this.deleteReservation = function (tokenToDelete, reservation) { return __awaiter(_this, void 0, void 0, function () {
            var err_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reservedHardwareRepository.manager.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var itemReservation, _a, itemID, itemQuantity;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = reservation;
                                            if (_a) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.getReservationFromToken(tokenToDelete, transaction)];
                                        case 1:
                                            _a = (_b.sent());
                                            _b.label = 2;
                                        case 2:
                                            itemReservation = _a;
                                            itemID = itemReservation.hardwareItem.id, itemQuantity = itemReservation.reservationQuantity;
                                            return [4 /*yield*/, this.removeReservation(itemReservation.reservationToken, transaction)];
                                        case 3:
                                            _b.sent();
                                            // Decrement the reservation count for the hardware item
                                            return [4 /*yield*/, transaction
                                                    .getRepository(entity_1.HardwareItem)
                                                    .decrement({ id: itemID }, "reservedStock", itemQuantity)];
                                        case 4:
                                            // Decrement the reservation count for the hardware item
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        throw new Error("Lost connection to database (hub)! " + err_4);
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Remove reservation is used to just directly remove a reservation entry from the database
         */
        this.removeReservation = function (tokenToRemove, transaction) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (transaction ? transaction.getRepository(entity_1.ReservedHardwareItem) : this.reservedHardwareRepository)
                            .createQueryBuilder()["delete"]()
                            .from(entity_1.ReservedHardwareItem)
                            .where("reservationToken = :token", { token: tokenToRemove })
                            .execute()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.doesReservationExist = function (userID, hardwareItemID) { return __awaiter(_this, void 0, void 0, function () {
            var numberOfReservations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.reservedHardwareRepository
                            .createQueryBuilder("reservation")
                            .innerJoinAndSelect("reservation.hardwareItem", "item")
                            .innerJoinAndSelect("reservation.user", "user")
                            .where("item.id = :itemId", { itemId: hardwareItemID })
                            .andWhere("user.id = :userId", { userId: userID })
                            .getCount()];
                    case 1:
                        numberOfReservations = _a.sent();
                        return [2 /*return*/, numberOfReservations > 0];
                }
            });
        }); };
        /**
         * Gets the user and hardware item that the reservation token is linked to
         * @param resToken Unique reservation token for the user reserved hardware item
         */
        this.getReservationFromToken = function (resToken, transaction) { return __awaiter(_this, void 0, void 0, function () {
            var reservation, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reservation = undefined;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (transaction ? transaction : this.reservedHardwareRepository.manager)
                                .getRepository(entity_1.ReservedHardwareItem)
                                .createQueryBuilder("reservation")
                                .innerJoin("reservation.user", "user")
                                .innerJoin("reservation.hardwareItem", "item")
                                .select(["user.id", "item.id", "reservation.isReserved", "reservation.reservationExpiry", "reservation.reservationQuantity"])
                                .where("reservation.reservationToken = :token", { token: resToken })
                                .getOne()];
                    case 2:
                        reservation = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        throw new Error("Lost connection to database (hub)! " + err_5);
                    case 4: return [2 /*return*/, reservation];
                }
            });
        }); };
        /**
         * Helper function to check that the expiry time has not been reached
         * @param expiryDate
         * @returns True if the reservation is valid, false otherwise
         */
        this.isReservationValid = function (expiryDate) {
            return Date.now() <= expiryDate.getTime();
        };
        this.reservedHardwareRepository = _reservedHardwareRepository.getRepository();
    }
    ReservedHardwareService = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject(types_1.TYPES.ReservedHardwareRepository))
    ], ReservedHardwareService);
    return ReservedHardwareService;
}());
exports.ReservedHardwareService = ReservedHardwareService;
