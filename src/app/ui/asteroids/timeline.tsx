import React from 'react';

// Временная шкала для отображения ближайших подходов
export default function Timeline({ closeApproachData }: any) {

    return (<div className="timeline">
        {closeApproachData.map((approach, index) => {
            return (
                <div key={index} className="timeline-item">
                    <div className="timeline-date">{approach.close_approach_date}</div>
                    <div className="timeline-info">
                        {`Approach to ${approach.orbiting_body} with velocity ${Math.round(approach.relative_velocity.kilometers_per_second)} km/s`}
                    </div>
                </div>
            )
        })}
    </div>
    );

}
