import React from 'react';

// Временная шкала для отображения ближайших подходов
export default function Timeline({ closeApproachData }: any) {

    return (<div className="timeline">
        {closeApproachData.map((approach: any, index: number) => {

            // Пример: относительная скорость первого ближайшего подхода
            const relative_velocity_first_approach = approach.relative_velocity.kilometers_per_second;
            // Расстояние до Земли в момент первого ближайшего подхода
            const miss_distance_first_approach = approach.miss_distance.kilometers;
            // Дата первого ближайшего подхода
            const close_approach_date_first_approach = approach.close_approach_date;
            return (
                <div key={index} className="timeline-item">
                    <div className="timeline-date">{close_approach_date_first_approach}</div>
                    <div className="timeline-date">{miss_distance_first_approach} distance</div>

                    <div className="timeline-info">
                        {`Approach to ${approach.orbiting_body} with velocity ${Math.round(relative_velocity_first_approach)} km/s`}
                    </div>
                </div>
            )
        })}
    </div>
    );

}
