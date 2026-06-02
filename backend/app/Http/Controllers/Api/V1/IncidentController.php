<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\IncidentReport;
use App\Services\IncidentReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function __construct(
        private IncidentReportingService $incidentService,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'incident_type' => 'required|string|in:accident,safety_concern,harassment,vehicle_damage,robbery,mechanical_failure,route_deviation,payment_issue,driver_misconduct,rider_misconduct,food_safety,delivery_damage,other',
            'severity' => 'required|string|in:low,medium,high,critical',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'ride_id' => 'nullable|integer|exists:rides,id',
            'delivery_id' => 'nullable|integer|exists:deliveries,id',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|mimes:jpg,jpeg,png,pdf,mp4|max:10240',
        ]);

        $incident = $this->incidentService->reportIncident(
            $request->user(),
            $request->incident_type,
            $request->severity,
            $request->title,
            $request->description,
            $request->ride_id,
            $request->delivery_id,
            $request->file('evidence'),
        );

        return response()->json([
            'message' => 'Incident reported',
            'incident' => $incident,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $incidents = $this->incidentService->getAllIncidents($request->status);

        return response()->json(['incidents' => $incidents]);
    }

    public function show(IncidentReport $incident): JsonResponse
    {
        $incident = $this->incidentService->getIncident($incident);

        return response()->json(['incident' => $incident]);
    }

    public function myIncidents(Request $request): JsonResponse
    {
        $incidents = $this->incidentService->getMyIncidents($request->user());

        return response()->json(['incidents' => $incidents]);
    }

    public function open(): JsonResponse
    {
        $incidents = $this->incidentService->getOpenIncidents();

        return response()->json(['incidents' => $incidents]);
    }

    public function assign(Request $request, IncidentReport $incident): JsonResponse
    {
        $this->incidentService->assignIncident($incident, $request->user()->id);

        return response()->json(['message' => 'Incident assigned']);
    }

    public function escalate(IncidentReport $incident, Request $request): JsonResponse
    {
        $this->incidentService->escalateIncident($incident, $request->user()->id);

        return response()->json(['message' => 'Incident escalated']);
    }

    public function resolve(Request $request, IncidentReport $incident): JsonResponse
    {
        $request->validate([
            'resolution' => 'required|string|max:2000',
        ]);

        $this->incidentService->resolveIncident($incident, $request->resolution);

        return response()->json(['message' => 'Incident resolved']);
    }

    public function close(IncidentReport $incident): JsonResponse
    {
        $this->incidentService->closeIncident($incident);

        return response()->json(['message' => 'Incident closed']);
    }

    public function stats(): JsonResponse
    {
        $stats = $this->incidentService->getIncidentStats();

        return response()->json(['stats' => $stats]);
    }

    public function downloadEvidence(IncidentReport $incident, int $index): \Symfony\Component\HttpFoundation\Response
    {
        return $this->incidentService->downloadEvidence($incident, $index);
    }
}
