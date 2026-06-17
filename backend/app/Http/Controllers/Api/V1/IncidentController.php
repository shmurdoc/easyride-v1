<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Incident\IncidentResolveRequest;
use App\Http\Requests\Api\V1\Incident\IncidentStoreRequest;
use App\Models\IncidentReport;
use App\Services\IncidentReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IncidentController extends Controller
{
    public function __construct(
        private IncidentReportingService $incidentService,
    ) {}

    public function store(IncidentStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $incident = $this->incidentService->reportIncident(
            $request->user(),
            $validated['incident_type'],
            $validated['severity'],
            $validated['title'],
            $validated['description'],
            $validated['ride_id'] ?? null,
            null,
            null,
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

    public function resolve(IncidentResolveRequest $request, IncidentReport $incident): JsonResponse
    {
        $validated = $request->validated();

        $this->incidentService->resolveIncident($incident, $validated['resolution']);

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

    public function downloadEvidence(IncidentReport $incident, int $index): Response
    {
        return $this->incidentService->downloadEvidence($incident, $index);
    }
}
