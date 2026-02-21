package com.orderly.complaint.repository;

import com.orderly.complaint.model.Complaint;
import com.orderly.complaint.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByClientId(Long clientId);
    List<Complaint> findByOrderId(Long orderId);
    List<Complaint> findByStatus(ComplaintStatus status);
}
